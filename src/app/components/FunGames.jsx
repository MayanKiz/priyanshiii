"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, RotateCcw, Trophy, ChevronRight, Brain, Music2, Palette, Star, Zap } from "lucide-react"

const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"
const FONT = "'Poppins', sans-serif"
const DISPLAY_FONT = "'Playfair Display', serif"

async function sendScore(gameName, score) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: `🎮 Game: ${gameName}\n⭐ Score: ${score}\n— Madam Jii played!` }),
    })
  } catch { }
}

function playTone(freq, dur, type = "sine", vol = 0.25) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = freq; o.type = type
    g.gain.setValueAtTime(vol, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    o.start(); o.stop(ctx.currentTime + dur)
  } catch { }
}
const sfx = {
  flip: () => playTone(440, 0.08, "sine", 0.15),
  match: () => [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.18, "sine", 0.25), i * 130)),
  wrong: () => [180, 150].forEach((f, i) => setTimeout(() => playTone(f, 0.2, "sawtooth", 0.2), i * 80)),
  correct: () => { playTone(880, 0.1, "sine", 0.25); setTimeout(() => playTone(1108, 0.18, "sine", 0.25), 100); setTimeout(() => playTone(1320, 0.22, "sine", 0.2), 200) },
  win: () => [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => playTone(f, 0.28, "sine", 0.3), i * 100)),
  tick: () => playTone(660, 0.04, "square", 0.08),
}

function vibrate(pattern = [60, 30, 60, 30, 100]) {
  if (navigator?.vibrate) navigator.vibrate(pattern)
}

// ══════════════════════════════════════════════
// SONG POOL — 160 songs
// ══════════════════════════════════════════════
const ALL_SONGS = [
  // ── SHADI WALE SONGS ──
  { answer: "Chunari Chunari", artist: "Kavita Krishnamurthy", ytId: "hQCob3TKCHM", options: ["Chunari Chunari", "Mehndi Laga Ke Rakhna", "Aaj Mere Yaar Ki Shaadi", "Dulhe Ka Sehra"] },
  { answer: "Mehndi Laga Ke Rakhna", artist: "Udit Narayan", ytId: "lS2TzbBFAYM", options: ["Mehndi Laga Ke Rakhna", "Chunari Chunari", "Aaj Mere Yaar Ki Shaadi", "Mere Haath Mein"] },
  { answer: "Aaj Mere Yaar Ki Shaadi", artist: "Udit Narayan", ytId: "K7NVeHuiScQ", options: ["Aaj Mere Yaar Ki Shaadi", "Chunari Chunari", "Bole Chudiyan", "Shaadi Mein Zaroor Aana"] },
  { answer: "Dulhe Ka Sehra", artist: "Kavita Krishnamurthy", ytId: "PVKYs9k1tOI", options: ["Dulhe Ka Sehra", "Mehndi Laga Ke Rakhna", "Chunari Chunari", "Aaj Ki Raat"] },
  { answer: "Gallan Goodiyaan", artist: "Shankar Ehsaan Loy", ytId: "V1q4lBuQ3SA", options: ["Gallan Goodiyaan", "Nachde Ne Saare", "Balle Balle", "Tenu Suit Suit"] },
  { answer: "Nachde Ne Saare", artist: "Pritam", ytId: "l6HA3dQqU9A", options: ["Nachde Ne Saare", "Gallan Goodiyaan", "Morni Banke", "Aaj Ki Raat"] },
  { answer: "Morni Banke", artist: "Guru Randhawa", ytId: "GniJAGAMnxk", options: ["Morni Banke", "Tenu Suit Suit Karta", "Nachde Ne Saare", "Hauli Hauli"] },
  { answer: "Tenu Suit Suit Karta", artist: "Guru Randhawa", ytId: "6GN-q3C6PCM", options: ["Tenu Suit Suit Karta", "Morni Banke", "Hauli Hauli", "Gallan Goodiyaan"] },
  { answer: "Hauli Hauli", artist: "Neha Kakkar", ytId: "8PNfwX2s7vM", options: ["Hauli Hauli", "Morni Banke", "Dilbar", "Aankh Marey"] },
  { answer: "Bole Chudiyan", artist: "Udit Narayan", ytId: "m4s_4UuNBUA", options: ["Bole Chudiyan", "Kabhi Khushi Kabhie Gham", "You Are My Soniya", "Deewana Hai Dekho"] },
  { answer: "Pallo Latke", artist: "Shilpa Rao", ytId: "gbV4jtXcuaQ", options: ["Pallo Latke", "Morni Banke", "Gallan Goodiyaan", "Tenu Suit Suit"] },
  { answer: "Aaj Ki Raat", artist: "A.R. Rahman", ytId: "JF2L9oECxCo", options: ["Aaj Ki Raat", "Lovely", "Gallan Goodiyaan", "Don't Let Me Down"] },

  // ── BOLLYWOOD ROMANTIC ──
  { answer: "Tum Hi Ho", artist: "Arijit Singh", ytId: "X4WNTORtpHI", options: ["Tum Hi Ho", "Channa Mereya", "Raabta", "Tera Ban Jaunga"] },
  { answer: "Kesariya", artist: "Arijit Singh", ytId: "BddP6PYo2gs", options: ["Kesariya", "Shayad", "Ae Dil Hai Mushkil", "Mere Naam Tu"] },
  { answer: "Raataan Lambiyan", artist: "Jubin Nautiyal", ytId: "D1fjOBiRkVo", options: ["Raataan Lambiyan", "Ve Maahi", "Ranjha", "Main Teri Ho Gayi"] },
  { answer: "Channa Mereya", artist: "Arijit Singh", ytId: "DHtBn-7JT3E", options: ["Channa Mereya", "Bulleya", "Ae Dil Hai Mushkil", "The Breakup Song"] },
  { answer: "Hawayein", artist: "Arijit Singh", ytId: "cRF7QHQKWIQ", options: ["Hawayein", "Rehnuma", "Tum Hi Ho", "Pehla Pyaar"] },
  { answer: "Tera Ban Jaunga", artist: "Akhil Sachdeva", ytId: "APPnLSHFbFQ", options: ["Tera Ban Jaunga", "Bekhayali", "Kaise Hua", "Mere Sohneya"] },
  { answer: "Bekhayali", artist: "Sachet Tandon", ytId: "TumTmx0dO4M", options: ["Bekhayali", "Tera Ban Jaunga", "Kaise Hua", "Kabir Singh Title"] },
  { answer: "Kaise Hua", artist: "Vishal Mishra", ytId: "cHf58jEWHDc", options: ["Kaise Hua", "Bekhayali", "Tujhe Kitna Chahne Lage", "Tera Ban Jaunga"] },
  { answer: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh", ytId: "0OyHJKR4UGI", options: ["Tujhe Kitna Chahne Lage", "Kaise Hua", "Bekhayali", "Pehla Pyaar"] },
  { answer: "Shayad", artist: "Arijit Singh", ytId: "4j3BwFdXi1c", options: ["Shayad", "Raabta", "Tujhe Kitna Chahne Lage", "Ik Vaari Aa"] },
  { answer: "Agar Tum Saath Ho", artist: "Arijit Singh & Alka Yagnik", ytId: "sK5PeKMQfR8", options: ["Agar Tum Saath Ho", "Channa Mereya", "Tum Hi Ho", "Hamari Adhuri Kahani"] },
  { answer: "Pehla Pyaar", artist: "Armaan Malik", ytId: "OFfx7HrfHfU", options: ["Pehla Pyaar", "Hawayein", "Tujhe Kitna Chahne Lage", "Tera Hone Laga Hoon"] },
  { answer: "Ve Maahi", artist: "Arijit Singh & Asees Kaur", ytId: "zH-ViNFvBe0", options: ["Ve Maahi", "Raataan Lambiyan", "Ranjha", "Paani Paani"] },
  { answer: "Ranjha", artist: "B Praak & Asees Kaur", ytId: "hk2cRv8DDRY", options: ["Ranjha", "Ve Maahi", "Filhaal", "Mann Bharrya"] },
  { answer: "Filhaal", artist: "B Praak", ytId: "CIOiJCSKaLo", options: ["Filhaal", "Ranjha", "Mann Bharrya", "Ik Pal Ka Jeena"] },
  { answer: "Mann Bharrya", artist: "B Praak", ytId: "kQfMrqjDg4Y", options: ["Mann Bharrya", "Filhaal", "Ranjha", "Qismat"] },
  { answer: "Mere Naam Tu", artist: "Abhay Jodhpurkar", ytId: "g_3Qn9KPBAM", options: ["Mere Naam Tu", "Hawayein", "Dilbaro", "Ae Watan"] },
  { answer: "Ik Vaari Aa", artist: "Arijit Singh", ytId: "MQMZ9LfSBGk", options: ["Ik Vaari Aa", "Hawa Hawa", "Saware", "Ae Dil Hai Mushkil"] },
  { answer: "Tere Vaaste", artist: "Varun Jain", ytId: "Z3Y8U3dG5Sc", options: ["Tere Vaaste", "Kahani Suno 2.0", "Pehla Pyaar", "Ik Vaari Aa"] },

  // ── 90s / 2000s CLASSICS ──
  { answer: "Kuch Kuch Hota Hai", artist: "Udit Narayan & Kavita", ytId: "c5OH2DVrHec", options: ["Kuch Kuch Hota Hai", "Tujhe Yaad Na Meri Aayee", "Ladki Badi Anjani Hai", "Koi Mil Gaya"] },
  { answer: "Taal Se Taal Mila", artist: "A.R. Rahman", ytId: "fW2T2RhJL5Q", options: ["Taal Se Taal Mila", "Ishq Bina", "Ruk Ja O Dil Deewane", "Dil Chahta Hai"] },
  { answer: "Dil To Pagal Hai", artist: "Lata Mangeshkar", ytId: "N6k5h_FTRQQ", options: ["Dil To Pagal Hai", "Tujhe Dekha Toh", "Are Re Are", "Ek Do Teen"] },
  { answer: "Tujhe Dekha Toh", artist: "Kumar Sanu & Lata", ytId: "kKPvFCiLBkM", options: ["Tujhe Dekha Toh", "Mehndi Laga Ke Rakhna", "Dil To Pagal Hai", "Baazigar O Baazigar"] },
  { answer: "Kabhi Khushi Kabhie Gham", artist: "Lata Mangeshkar", ytId: "jPc5MaXBTYk", options: ["Kabhi Khushi Kabhie Gham", "Bole Chudiyan", "You Are My Soniya", "Suraj Hua Maddham"] },
  { answer: "Suraj Hua Maddham", artist: "Sonu Nigam & Alka Yagnik", ytId: "0VXk23lk3Gk", options: ["Suraj Hua Maddham", "Bole Chudiyan", "Kabhi Khushi Kabhie Gham", "Poo Ba"] },
  { answer: "Dil Chahta Hai", artist: "Shankar Mahadevan", ytId: "KOJkNfOqpPU", options: ["Dil Chahta Hai", "Jaane Kyun", "Koi Kahe Kehta Rahe", "Woh Ladki Hai Kahaan"] },
  { answer: "Hawa Hawa", artist: "Arjit Singh", ytId: "iUcnhQTK1b4", options: ["Hawa Hawa", "Ik Vaari Aa", "Ae Zindagi Gale Laga Le", "Saware"] },
  { answer: "Koi Mil Gaya", artist: "Udit Narayan", ytId: "aaEcePy4c2E", options: ["Koi Mil Gaya", "Kuch Kuch Hota Hai", "Kal Ho Na Ho", "Main Prem Ki Diwani Hoon"] },
  { answer: "Kal Ho Na Ho", artist: "Sonu Nigam", ytId: "6iMVAXZi4qQ", options: ["Kal Ho Na Ho", "Koi Mil Gaya", "Yeh Dil Deewana", "Main Hoon Na"] },
  { answer: "Main Hoon Na", artist: "Sonu Nigam", ytId: "lqsGFAhKtyc", options: ["Main Hoon Na", "Kal Ho Na Ho", "Yeh Dil Deewana", "Tumse Milna"] },
  { answer: "Yeh Dil Deewana", artist: "Udit Narayan", ytId: "Soo1R1gCGFs", options: ["Yeh Dil Deewana", "Main Hoon Na", "Kal Ho Na Ho", "Pardes Mein Tha Mera Dil"] },
  { answer: "Dilbar Dilbar", artist: "Neha Kakkar", ytId: "gfxcFE0_YA4", options: ["Dilbar Dilbar", "Hauli Hauli", "Kamariya", "Tip Tip Barsa Paani"] },
  { answer: "Kamariya", artist: "Darshan Raval", ytId: "FL8QnuAL_3c", options: ["Kamariya", "Dilbar Dilbar", "Bom Diggy Diggy", "Pallo Latke"] },

  // ── ITEM / DANCE ──
  { answer: "Aankh Marey", artist: "Kumar Sanu", ytId: "4T5KMpHCVOI", options: ["Aankh Marey", "Ole Ole", "Tip Tip Barsa Pani", "Chura Ke Dil Mera"] },
  { answer: "Tip Tip Barsa Pani", artist: "Udit Narayan", ytId: "WG-Gp9ZAqsI", options: ["Tip Tip Barsa Pani", "Aankh Marey", "Jumma Chumma", "Ole Ole"] },
  { answer: "Jumma Chumma De De", artist: "Kavita Krishnamurthy", ytId: "OBJvL_GzX4I", options: ["Jumma Chumma De De", "Tip Tip Barsa Pani", "Aankh Marey", "Choli Ke Peeche"] },
  { answer: "Choli Ke Peeche", artist: "Alka Yagnik & Ila Arun", ytId: "7p3YBhHl3Yk", options: ["Choli Ke Peeche", "Jumma Chumma De De", "Zandu Balm", "Munni Badnaam"] },
  { answer: "Munni Badnaam Hui", artist: "Mamta Sharma", ytId: "mDwPFBjWcNI", options: ["Munni Badnaam Hui", "Sheila Ki Jawani", "Choli Ke Peeche", "Fevicol Se"] },
  { answer: "Sheila Ki Jawani", artist: "Sunidhi Chauhan", ytId: "APoFpBHFkw4", options: ["Sheila Ki Jawani", "Munni Badnaam Hui", "Fevicol Se", "Jalebi Bai"] },
  { answer: "Fevicol Se", artist: "Sunidhi Chauhan", ytId: "X1_EsZNUwrg", options: ["Fevicol Se", "Sheila Ki Jawani", "Munni Badnaam Hui", "Chikni Chameli"] },
  { answer: "Chikni Chameli", artist: "Shreya Ghoshal", ytId: "WlrN8mJrBkY", options: ["Chikni Chameli", "Fevicol Se", "Sheila Ki Jawani", "Lovely"] },
  { answer: "Lovely", artist: "Kanika Kapoor", ytId: "Ng4MMsknPKk", options: ["Lovely", "Chikni Chameli", "Badtameez Dil", "Ghagra"] },
  { answer: "Badtameez Dil", artist: "Shalmali Kholgade", ytId: "YwHBfmGap3A", options: ["Badtameez Dil", "Lovely", "Balam Pichkari", "Dhinka Chika"] },
  { answer: "Balam Pichkari", artist: "Shalmali Kholgade", ytId: "8G0SKU37bOs", options: ["Balam Pichkari", "Badtameez Dil", "Dhinka Chika", "Kar Gayi Chull"] },
  { answer: "Kar Gayi Chull", artist: "Neha Kakkar", ytId: "NTHz8G7biqs", options: ["Kar Gayi Chull", "Gallan Goodiyaan", "Tenu Suit Suit", "Balam Pichkari"] },
  { answer: "Bom Diggy Diggy", artist: "Zack Knight", ytId: "eBGIQ7ZuuiU", options: ["Bom Diggy Diggy", "Kamariya", "Dilbar Dilbar", "Pallo Latke"] },
  { answer: "Ghungroo", artist: "Arijit Singh & Shilpa Rao", ytId: "qFkNATtMO-w", options: ["Ghungroo", "Bom Diggy Diggy", "Kar Gayi Chull", "Akh Lad Jaave"] },
  { answer: "Akh Lad Jaave", artist: "Jubin Nautiyal & Asees Kaur", ytId: "Ro_qRB9zJ4Q", options: ["Akh Lad Jaave", "Ghungroo", "Dilbar Dilbar", "Morni Banke"] },

  // ── INDIE / COKE STUDIO ──
  { answer: "Pasoori", artist: "Ali Sethi & Shae Gill", ytId: "gdPEc5bwkR4", options: ["Pasoori", "Kahani Suno", "Wo Larki", "Tere Vaaste"] },
  { answer: "Kahani Suno 2.0", artist: "Kaifi Khalil", ytId: "y_FxRkuaT4s", options: ["Kahani Suno 2.0", "Pasoori", "Wo Larki", "Tere Vaaste"] },
  { answer: "Tu Hai Kahan", artist: "Coke Studio", ytId: "0K-0JBe7MiU", options: ["Tu Hai Kahan", "Pasoori", "Kahani Suno 2.0", "Ae Dil Hai Mushkil"] },
  { answer: "Tera Hone Laga Hoon", artist: "Atif Aslam", ytId: "SHa7fWiXFMI", options: ["Tera Hone Laga Hoon", "Tu Jaane Na", "Doorie", "Woh Lamhe"] },
  { answer: "Tu Jaane Na", artist: "Atif Aslam", ytId: "lLdIQrPSJX4", options: ["Tu Jaane Na", "Tera Hone Laga Hoon", "Doorie", "Woh Lamhe"] },
  { answer: "Woh Lamhe", artist: "Atif Aslam", ytId: "3c6j9Gi3t_w", options: ["Woh Lamhe", "Tera Hone Laga Hoon", "Tu Jaane Na", "Doorie"] },
  { answer: "Tum Se Hi", artist: "Mohit Chauhan", ytId: "JTq65ZtfYnk", options: ["Tum Se Hi", "Woh Lamhe", "Tu Jaane Na", "Phir Se Ud Chala"] },
  { answer: "Phir Le Aaya Dil", artist: "Rekha Bhardwaj", ytId: "N5d0A3h3Igs", options: ["Phir Le Aaya Dil", "Tum Se Hi", "Woh Lamhe", "Ik Vaari Aa"] },
  { answer: "Ilahi", artist: "Mohit Chauhan", ytId: "vkAuXvZz8fA", options: ["Ilahi", "Phir Le Aaya Dil", "Tum Se Hi", "Ik Vaari Aa"] },

  // ── PUNJABI HITS ──
  { answer: "Makhna", artist: "Honey Singh", ytId: "2LK0OikfVEE", options: ["Makhna", "Loca", "Koka", "High Rated Gabru"] },
  { answer: "Koka", artist: "Badshah & Sunanda Sharma", ytId: "0ckT-UmR3ic", options: ["Koka", "Makhna", "Loca", "Yaad Piya Ki Aane Lagi"] },
  { answer: "Loca", artist: "Yo Yo Honey Singh", ytId: "U8f4X68CtDM", options: ["Loca", "Koka", "Makhna", "Kala Chashma"] },
  { answer: "Kala Chashma", artist: "Badshah & Aastha Gill", ytId: "k4yXQeheHNY", options: ["Kala Chashma", "Loca", "Koka", "Bachna Ae Haseeno"] },
  { answer: "Proper Patola", artist: "Badshah & Diljit Dosanjh", ytId: "E0nh_gXn6lg", options: ["Proper Patola", "Kala Chashma", "Koka", "Loca"] },
  { answer: "Qismat", artist: "B Praak", ytId: "S3EAhiA1jnk", options: ["Qismat", "Mann Bharrya", "Filhaal", "Ranjha"] },
  { answer: "Sauda Khara Khara", artist: "Diljit Dosanjh", ytId: "i_P3KYNq6cg", options: ["Sauda Khara Khara", "Proper Patola", "Kala Chashma", "Qismat"] },
  { answer: "High Rated Gabru", artist: "Guru Randhawa", ytId: "N8AJA3fHdBY", options: ["High Rated Gabru", "Morni Banke", "Tenu Suit Suit", "Ban Ja Rani"] },
  { answer: "Ban Ja Rani", artist: "Guru Randhawa", ytId: "O8-f5BcLmDE", options: ["Ban Ja Rani", "High Rated Gabru", "Lahore", "Ishq Tera"] },
  { answer: "Lahore", artist: "Guru Randhawa", ytId: "YwLKnbMBXOk", options: ["Lahore", "Ban Ja Rani", "High Rated Gabru", "Naah"] },

  // ── LATEST BOLLYWOOD ──
  { answer: "Kesariya", artist: "Arijit Singh", ytId: "BddP6PYo2gs", options: ["Kesariya", "Shayad", "Tum Hi Ho", "Ae Dil Hai Mushkil"] },
  { answer: "Srivalli", artist: "Sid Sriram", ytId: "B89lFOeRj2M", options: ["Srivalli", "Oo Antava", "Naacho Naacho", "Saami Saami"] },
  { answer: "Oo Antava", artist: "Indravathi Chauhan", ytId: "bOGOAqzs5gU", options: ["Oo Antava", "Srivalli", "Naatu Naatu", "Saami Saami"] },
  { answer: "Naatu Naatu", artist: "Rahul Sipligunj & Kaala Bhairava", ytId: "OsU0CGZoV8E", options: ["Naatu Naatu", "Srivalli", "Oo Antava", "Naacho Naacho"] },
  { answer: "Jhoome Jo Pathaan", artist: "Arijit Singh & Sukriti Kakar", ytId: "oUxCCEBDmHI", options: ["Jhoome Jo Pathaan", "Besharam Rang", "Raataan Lambiyan", "Kesariya"] },
  { answer: "Besharam Rang", artist: "Caralisa Monteiro", ytId: "LrXFMGaGflw", options: ["Besharam Rang", "Jhoome Jo Pathaan", "Oo Antava", "Srivalli"] },
  { answer: "Arjan Vailly", artist: "Bhupinder Babbal", ytId: "BbgKFP37mFg", options: ["Arjan Vailly", "Satranga", "Tere Vaaste", "Ranjha"] },
  { answer: "Satranga", artist: "Arijit Singh", ytId: "ITmkv4oiMiw", options: ["Satranga", "Arjan Vailly", "Kesariya", "Tere Vaaste"] },
  { answer: "Naacho Naacho", artist: "Rahul Sipligunj", ytId: "OsU0CGZoV8E", options: ["Naacho Naacho", "Naatu Naatu", "Srivalli", "Oo Antava"] },
  { answer: "Jugraafiya", artist: "Stebin Ben", ytId: "FdBIGXnfXns", options: ["Jugraafiya", "Tere Vaaste", "Kahani Suno 2.0", "Ranjha"] },

  // ── ENGLISH LOVE CLASSICS ──
  { answer: "Perfect", artist: "Ed Sheeran", ytId: "2Vv-BfVoq4g", options: ["Perfect", "Thinking Out Loud", "Photograph", "Happier"] },
  { answer: "Thinking Out Loud", artist: "Ed Sheeran", ytId: "lp-EO5I60KA", options: ["Thinking Out Loud", "Perfect", "Shape of You", "Castle on the Hill"] },
  { answer: "All of Me", artist: "John Legend", ytId: "450p7goxZqg", options: ["All of Me", "Ordinary People", "Stay With You", "So High"] },
  { answer: "A Thousand Years", artist: "Christina Perri", ytId: "QJO3ROT-A4E", options: ["A Thousand Years", "Jar of Hearts", "Human", "Arms"] },
  { answer: "Can't Help Falling in Love", artist: "Elvis Presley", ytId: "ivGnFSRFJdI", options: ["Can't Help Falling in Love", "Love Me Tender", "Always on My Mind", "Suspicious Minds"] },
  { answer: "Lover", artist: "Taylor Swift", ytId: "E1ILXnn1o5s", options: ["Lover", "Love Story", "You Belong With Me", "Wildest Dreams"] },
  { answer: "Love Story", artist: "Taylor Swift", ytId: "8xg3vE8Ie_E", options: ["Love Story", "Lover", "Fearless", "Mine"] },
  { answer: "Shallow", artist: "Lady Gaga & Bradley Cooper", ytId: "bo_efYhYU2A", options: ["Shallow", "Always Remember Us This Way", "I'll Never Love Again", "Is That Alright"] },
  { answer: "Someone Like You", artist: "Adele", ytId: "hLQl3WQQoQ0", options: ["Someone Like You", "Hello", "Rolling in the Deep", "Set Fire to the Rain"] },
  { answer: "Hello", artist: "Adele", ytId: "YQHsXMglC9A", options: ["Hello", "Someone Like You", "Rolling in the Deep", "Set Fire to the Rain"] },
  { answer: "Shape of You", artist: "Ed Sheeran", ytId: "JGwWNGJdvx8", options: ["Shape of You", "Perfect", "Thinking Out Loud", "Photograph"] },
  { answer: "Photograph", artist: "Ed Sheeran", ytId: "nSDgHBxUbVQ", options: ["Photograph", "Perfect", "Thinking Out Loud", "Shape of You"] },
  { answer: "Stay With Me", artist: "Sam Smith", ytId: "pB-5XG-DbAA", options: ["Stay With Me", "Writing's on the Wall", "Too Good at Goodbyes", "Lay Me Down"] },
  { answer: "Marry You", artist: "Bruno Mars", ytId: "dElRVQFqj-k", options: ["Marry You", "Just the Way You Are", "Grenade", "Count On Me"] },
  { answer: "Just the Way You Are", artist: "Bruno Mars", ytId: "LjhCEyc3b8Y", options: ["Just the Way You Are", "Marry You", "Grenade", "When I Was Your Man"] },
  { answer: "Speechless", artist: "Dan + Shay", ytId: "Y-4WkJ9Gg7s", options: ["Speechless", "Tequila", "Nothin' Like You", "From the Ground Up"] },
  { answer: "Unforgettable", artist: "French Montana ft. Swae Lee", ytId: "Lt_HzxIMQnk", options: ["Unforgettable", "Swalla", "Tip Toe", "Bounce Back"] },
  { answer: "Closer", artist: "The Chainsmokers ft. Halsey", ytId: "PT2_F-1esPk", options: ["Closer", "Don't Let Me Down", "Something Just Like This", "Paris"] },
  { answer: "Something Just Like This", artist: "The Chainsmokers & Coldplay", ytId: "FM7MFYoylVs", options: ["Something Just Like This", "Closer", "Don't Let Me Down", "Paris"] },
  { answer: "Blinding Lights", artist: "The Weeknd", ytId: "4NRXx6pTmEM", options: ["Blinding Lights", "Starboy", "Save Your Tears", "Can't Feel My Face"] },
  { answer: "Starboy", artist: "The Weeknd ft. Daft Punk", ytId: "34Na4j8AVgA", options: ["Starboy", "Blinding Lights", "Save Your Tears", "Heartless"] },

  // ── EXTRA HINDI HITS ──
  { answer: "Ude Dil Befikre", artist: "Benny Dayal", ytId: "eHCfrtBHLGU", options: ["Ude Dil Befikre", "Sooraj Dooba Hain", "Aashiqui Mein Teri", "Abhi Abhi"] },
  { answer: "Gerua", artist: "Arijit Singh", ytId: "AEIVhBS6baE", options: ["Gerua", "Ude Dil Befikre", "Sooraj Dooba Hain", "Mast Magan"] },
  { answer: "Mast Magan", artist: "Arijit Singh & Chinmayi", ytId: "oXBNQC2EFRs", options: ["Mast Magan", "Gerua", "2 States Title", "Kai Po Che"] },
  { answer: "Ae Dil Hai Mushkil", artist: "Arijit Singh", ytId: "6FURuLYb52I", options: ["Ae Dil Hai Mushkil", "Channa Mereya", "Bulleya", "The Breakup Song"] },
  { answer: "Bulleya", artist: "Amit Mishra & Shilpa Rao", ytId: "3sKPXNfHLHc", options: ["Bulleya", "Ae Dil Hai Mushkil", "Channa Mereya", "The Breakup Song"] },
  { answer: "Arijit Singh Mashup", artist: "Arijit Singh", ytId: "H-V1Fz4M4xg", options: ["Arijit Singh Mashup", "Tum Hi Ho", "Channa Mereya", "Bulleya"] },
  { answer: "Raabta", artist: "Arijit Singh & Nikhita Gandhi", ytId: "D__CaFABMPE", options: ["Raabta", "Shayad", "Ik Vaari Aa", "Gerua"] },
  { answer: "Pani Da Rang", artist: "Ayushmann Khurrana", ytId: "2OeSMYHGT1c", options: ["Pani Da Rang", "Ik Vaari Aa", "Mitti Di Khushboo", "Paani Wala Dance"] },
  { answer: "Roke Na Ruke Naina", artist: "Arijit Singh", ytId: "uTasU_5jSmg", options: ["Roke Na Ruke Naina", "Gerua", "Raabta", "Tum Hi Ho"] },
  { answer: "Teri Mitti", artist: "B Praak", ytId: "IbAcCr2WHAI", options: ["Teri Mitti", "Filhaal", "Mann Bharrya", "Qismat"] },
  { answer: "Dil Diyan Gallan", artist: "Atif Aslam", ytId: "tFmWqnLMhFY", options: ["Dil Diyan Gallan", "Tu Jaane Na", "Woh Lamhe", "Tera Hone Laga Hoon"] },
  { answer: "Soch Na Sake", artist: "Arijit Singh", ytId: "vbLCpkFgLTI", options: ["Soch Na Sake", "Dil Diyan Gallan", "Hawayein", "Raabta"] },
  { answer: "Ik Pal Ka Jeena", artist: "Udit Narayan", ytId: "jXQS8RakJkw", options: ["Ik Pal Ka Jeena", "Filhaal", "Koi Mil Gaya", "Kal Ho Na Ho"] },
  { answer: "Pehli Nazar Mein", artist: "Atif Aslam", ytId: "RCnAEVtLfhI", options: ["Pehli Nazar Mein", "Dil Diyan Gallan", "Tu Jaane Na", "Tera Hone Laga Hoon"] },
  { answer: "Sun Saathiya", artist: "Divya Kumar & Siddharth Mahadevan", ytId: "6KwKBe-bQ3Q", options: ["Sun Saathiya", "Hawayein", "Mast Magan", "Gerua"] },
  { answer: "Tumhari Sulu Title", artist: "Rekha Bhardwaj & Shaan", ytId: "Bvp_BxkM4iQ", options: ["Tumhari Sulu Title", "Sun Saathiya", "Mast Magan", "Ike Vaari Aa"] },
  { answer: "London Thumakda", artist: "Labh Janjua & Sonu Kakkar", ytId: "ZFEbS86JfYw", options: ["London Thumakda", "Gallan Goodiyaan", "Pallo Latke", "Kar Gayi Chull"] },
  { answer: "Nagada Sang Dhol", artist: "Shreya Ghoshal & Osman Mir", ytId: "f__c5M7v9cc", options: ["Nagada Sang Dhol", "London Thumakda", "Gallan Goodiyaan", "Bole Chudiyan"] },
  { answer: "Ghagra", artist: "Rekha Bhardwaj", ytId: "s3STGE5vFKo", options: ["Ghagra", "Nagada Sang Dhol", "Lovely", "Badtameez Dil"] },
  { answer: "Ole Ole", artist: "Udit Narayan", ytId: "nMH2kDkFVH8", options: ["Ole Ole", "Aankh Marey", "Tip Tip Barsa Pani", "Chunari Chunari"] },
]

function getRandomSongs(pool, count = 5) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// ════════════════════════════════════════════════════════════════════════════
// SONG GUESS GAME
// ════════════════════════════════════════════════════════════════════════════
const GUESS_TIME = 15

function SongGuessGame({ onScore }) {
  const [songs] = useState(() => getRandomSongs(ALL_SONGS, 5))
  const [cur, setCur] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GUESS_TIME)
  const [selected, setSelected] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const timerRef = useRef(null)
  const timeRef = useRef(GUESS_TIME)
  const song = songs[cur]

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timeRef.current = GUESS_TIME
    setTimeLeft(GUESS_TIME)
    timerRef.current = setInterval(() => {
      timeRef.current -= 1
      setTimeLeft(timeRef.current)
      if (timeRef.current <= 3) sfx.tick()
      if (timeRef.current <= 0) {
        clearInterval(timerRef.current)
        const nr = [...results, { correct: false, pts: 0, song: song.answer, artist: song.artist }]
        setResults(nr)
        goNext(totalScore, nr)
      }
    }, 1000)
  }, [cur, results, totalScore, song])

  useEffect(() => {
    setSelected(null)
    setWrongFlash(false)
    setIframeKey(k => k + 1)
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [cur])

  const goNext = (ns, nr) => {
    if (cur + 1 >= songs.length) {
      setDone(true); sfx.win()
      sendScore("Song Guess", ns); onScore(ns)
    } else {
      setCur(c => c + 1)
    }
  }

  const handleAnswer = (opt) => {
    if (selected !== null) return
    clearInterval(timerRef.current)
    const correct = opt === song.answer
    const pts = correct ? Math.max(5, Math.round((timeRef.current / GUESS_TIME) * 30)) : -5
    setSelected(opt)
    if (correct) {
      sfx.correct()
      const nr = [...results, { correct: true, pts, song: song.answer, artist: song.artist }]
      const ns = totalScore + pts
      setResults(nr); setTotalScore(ns)
      setTimeout(() => goNext(ns, nr), 900)
    } else {
      sfx.wrong(); vibrate()
      setWrongFlash(true)
      setTimeout(() => setWrongFlash(false), 600)
      const nr = [...results, { correct: false, pts, song: song.answer, artist: song.artist }]
      const ns = totalScore + pts
      setResults(nr); setTotalScore(ns)
      setTimeout(() => goNext(ns, nr), 1400)
    }
  }

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center space-y-3">
      <div className="flex justify-center mb-2">
        <span style={{ fontSize: 48 }}>🎵</span>
      </div>
      <p style={{ fontFamily: FONT, color: "#fff", fontSize: 20, fontWeight: 800 }}>Wah Madam Jii!</p>
      <div style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)", borderRadius: 20, padding: "12px 28px", display: "inline-block" }}>
        <p style={{ fontFamily: FONT, color: "#fff", fontSize: 34, fontWeight: 900, margin: 0 }}>{totalScore} pts</p>
      </div>
      <div className="space-y-2 mt-3 w-full">
        {results.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="flex justify-between items-center px-4 py-2.5 rounded-2xl"
            style={{ background: r.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${r.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)"}` }}>
            <div className="text-left">
              <p style={{ fontFamily: FONT, color: r.correct ? "#4ade80" : "#f87171", fontSize: 12, fontWeight: 700, margin: 0 }}>{r.correct ? "✓" : "✗"} {r.song}</p>
              <p style={{ fontFamily: FONT, color: "rgba(255,255,255,0.4)", fontSize: 10, margin: 0 }}>{r.artist}</p>
            </div>
            <span style={{ fontFamily: FONT, color: r.pts > 0 ? "#4ade80" : "#f87171", fontWeight: 900, fontSize: 14 }}>{r.pts > 0 ? "+" : ""}{r.pts}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const timePct = (timeLeft / GUESS_TIME) * 100
  const timerColor = timeLeft > 8 ? "#ec4899" : timeLeft > 4 ? "#f59e0b" : "#ef4444"

  return (
    <motion.div
      className="flex flex-col items-center gap-3 w-full"
      animate={wrongFlash ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.45 }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-1">
        <div style={{ background: "rgba(236,72,153,0.12)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 20, padding: "4px 12px" }}>
          <span style={{ fontFamily: FONT, color: "#ec4899", fontSize: 11, fontWeight: 700 }}>🎵 Song {cur + 1} / {songs.length}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "4px 14px" }}>
          <span style={{ fontFamily: FONT, color: "#fff", fontSize: 13, fontWeight: 900 }}>{totalScore} pts</span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full">
        <div className="flex justify-between mb-1.5">
          <span style={{ fontFamily: FONT, color: "rgba(255,255,255,0.4)", fontSize: 10 }}>⚡ Jaldi karo = zyada points!</span>
          <span style={{ fontFamily: FONT, color: timerColor, fontSize: 13, fontWeight: 800 }}>{timeLeft}s</span>
        </div>
        <div style={{ width: "100%", height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <motion.div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${timerColor}, ${timerColor}88)` }}
            animate={{ width: `${timePct}%` }} transition={{ duration: 0.9, ease: "linear" }} />
        </div>
      </div>

      {/* YouTube Player */}
      <AnimatePresence mode="wait">
        <motion.div key={`player-${cur}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          style={{ width: "100%", borderRadius: 20, overflow: "hidden", border: "1.5px solid rgba(139,92,246,0.3)", background: "#0a0518", boxShadow: "0 8px 32px rgba(139,92,246,0.15)" }}>
          <iframe
            key={`yt-${iframeKey}`}
            src={`https://www.youtube.com/embed/${song.ytId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&start=30`}
            allow="autoplay; encrypted-media"
            style={{ width: "100%", height: 72, border: "none", display: "block" }}
            title="song"
          />
          <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#ec4899", boxShadow: "0 0 8px #ec4899", flexShrink: 0 }} />
            <span style={{ fontFamily: FONT, color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Ye kaun sa gaana hai? Jaldi batao!</span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%" }}>
        {song.options.map((opt, idx) => {
          const isSel = selected === opt
          const isCorrect = opt === song.answer
          let bg = "rgba(255,255,255,0.04)"
          let border = "rgba(255,255,255,0.1)"
          let color = "rgba(255,255,255,0.85)"
          let shadow = "none"
          if (selected !== null) {
            if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "#4ade80"; color = "#4ade80"; shadow = "0 0 16px rgba(34,197,94,0.25)" }
            else if (isSel) { bg = "rgba(239,68,68,0.15)"; border = "#f87171"; color = "#f87171"; shadow = "0 0 16px rgba(239,68,68,0.25)" }
          }
          return (
            <motion.button key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
              style={{ fontFamily: FONT, background: bg, border: `1.5px solid ${border}`, color, borderRadius: 16, padding: "12px 10px", fontSize: 12, fontWeight: 700, boxShadow: shadow, cursor: selected ? "default" : "pointer", transition: "all 0.2s" }}
              whileHover={!selected ? { scale: 1.04, background: "rgba(255,255,255,0.08)" } : {}}
              whileTap={!selected ? { scale: 0.95 } : {}}
            >
              {opt}
            </motion.button>
          )
        })}
      </div>

      {/* Minus warning */}
      <p style={{ fontFamily: FONT, color: "rgba(248,113,113,0.6)", fontSize: 10, textAlign: "center" }}>❌ Galat jawab = -5 pts • Jaldi sahi = +30 pts</p>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MEMORY MATCH
// ════════════════════════════════════════════════════════════════════════════
const CARD_SYMBOLS = [
  { id: "heart", emoji: "💕", color: "#ec4899" },
  { id: "star", emoji: "⭐", color: "#f59e0b" },
  { id: "moon", emoji: "🌙", color: "#818cf8" },
  { id: "fire", emoji: "🔥", color: "#f97316" },
  { id: "bolt", emoji: "⚡", color: "#60a5fa" },
  { id: "gem", emoji: "💎", color: "#a78bfa" },
  { id: "flower", emoji: "🌸", color: "#f472b6" },
  { id: "music", emoji: "🎵", color: "#34d399" },
]

function MemoryCard({ symbol, flipped, matched, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      className="aspect-square cursor-pointer"
      whileTap={{ scale: 0.88 }}
      style={{ perspective: 600 }}
    >
      <motion.div style={{ width: "100%", height: "100%", transformStyle: "preserve-3d", position: "relative" }}
        animate={{ rotateY: flipped || matched ? 180 : 0 }}
        transition={{ duration: 0.28, type: "spring", stiffness: 260 }}>
        {/* Back */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 14,
          background: "linear-gradient(135deg,#7c3aed 0%,#db2777 100%)",
          boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: 18, opacity: 0.6 }}>✦</span>
        </div>
        {/* Front */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 14,
          background: matched ? "rgba(34,197,94,0.1)" : `${symbol.color}12`,
          border: `2px solid ${matched ? "rgba(34,197,94,0.4)" : symbol.color + "50"}`,
          boxShadow: matched ? "none" : `0 0 14px ${symbol.color}25`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ fontSize: 22, filter: matched ? "grayscale(0.5) opacity(0.6)" : "none" }}>{symbol.emoji}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

function MemoryGame({ onScore }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)
  const [matchedCount, setMatchedCount] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const init = () => {
    const syms = [...CARD_SYMBOLS, ...CARD_SYMBOLS].sort(() => Math.random() - 0.5).map((s, i) => ({ ...s, uid: i, flipped: false, matched: false }))
    setCards(syms); setFlipped([]); setMoves(0); setMatchedCount(0); setDisabled(false); setDone(false); setScore(0)
  }
  useEffect(() => { init() }, [])

  const flip = (uid) => {
    if (disabled || flipped.length === 2) return
    const c = cards.find(x => x.uid === uid)
    if (!c || c.flipped || c.matched) return
    sfx.flip()
    const next = cards.map(x => x.uid === uid ? { ...x, flipped: true } : x)
    setCards(next)
    const nf = [...flipped, uid]
    setFlipped(nf)
    if (nf.length === 2) {
      setDisabled(true); setMoves(m => m + 1)
      const [a, b] = nf.map(id => next.find(x => x.uid === id))
      if (a.id === b.id) {
        sfx.match()
        const done2 = next.map(x => nf.includes(x.uid) ? { ...x, matched: true } : x)
        setCards(done2); setFlipped([]); setDisabled(false)
        setMatchedCount(mc => {
          const nm = mc + 1
          if (nm === CARD_SYMBOLS.length) {
            const fs = Math.max(0, 100 - (moves + 1) * 2)
            setScore(fs); setDone(true); sfx.win()
            sendScore("Memory Match", fs); onScore(fs)
          }
          return nm
        })
      } else {
        sfx.wrong(); vibrate([40, 20, 40])
        setTimeout(() => { setCards(p => p.map(x => nf.includes(x.uid) ? { ...x, flipped: false } : x)); setFlipped([]); setDisabled(false) }, 750)
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full">
        <span style={{ fontFamily: FONT, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>चालें: <strong style={{ color: "#fff" }}>{moves}</strong></span>
        <span style={{ fontFamily: FONT, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>जोड़े: <strong style={{ color: "#f472b6" }}>{matchedCount}/{CARD_SYMBOLS.length}</strong></span>
        <button onClick={init} style={{ color: "#7c3aed", padding: 4, borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <RotateCcw size={13} />
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, width: "100%" }}>
        {cards.map(c => <MemoryCard key={c.uid} symbol={c} flipped={c.flipped} matched={c.matched} onClick={() => flip(c.uid)} />)}
      </div>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="text-center mt-1">
            <span style={{ fontSize: 40 }}>🎉</span>
            <p style={{ fontFamily: FONT, color: "#fff", fontWeight: 800, marginTop: 4 }}>{moves} चालों में पूरा किया!</p>
            <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 26, fontWeight: 900 }}>{score} pts</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// COLOR MATCH
// ════════════════════════════════════════════════════════════════════════════
const COLORS = [
  { name: "लाल", hex: "#ef4444" },
  { name: "नीला", hex: "#3b82f6" },
  { name: "हरा", hex: "#22c55e" },
  { name: "पीला", hex: "#eab308" },
  { name: "गुलाबी", hex: "#ec4899" },
  { name: "बैंगनी", hex: "#a855f7" },
]
function makeQ() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)]
  let ink = COLORS[Math.floor(Math.random() * COLORS.length)]
  while (ink.name === word.name) ink = COLORS[Math.floor(Math.random() * COLORS.length)]
  const opts = [ink, ...COLORS.filter(c => c.name !== ink.name).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5)
  return { word: word.name, inkHex: ink.hex, inkName: ink.name, opts }
}

function ColorMatchGame({ onScore }) {
  const [qs] = useState(() => Array.from({ length: 10 }, makeQ))
  const [cur, setCur] = useState(0)
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(20)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [wrongFlash, setWrongFlash] = useState(false)
  const timerRef = useRef(null)
  const scoreRef = useRef(0)
  const resultsRef = useRef([])

  const finish = useCallback((fs) => {
    setDone(true); sfx.win()
    sendScore("Color Match", fs); onScore(fs)
  }, [onScore])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(timerRef.current); finish(scoreRef.current); return 0 }
        if (t <= 5) sfx.tick()
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [finish])

  const answer = (name) => {
    if (selected || done) return
    const q = qs[cur], correct = name === q.inkName
    if (correct) sfx.correct()
    else { sfx.wrong(); vibrate([50, 30, 50]); setWrongFlash(true); setTimeout(() => setWrongFlash(false), 500) }
    const pts = correct ? 10 : -5
    const ns = score + pts, nr = [...results, { correct, pts }]
    scoreRef.current = ns; resultsRef.current = nr
    setSelected(name); setScore(ns); setResults(nr)
    setTimeout(() => {
      if (cur + 1 >= qs.length) { clearInterval(timerRef.current); finish(ns) }
      else { setCur(c => c + 1); setSelected(null) }
    }, 450)
  }

  const q = qs[cur]
  if (done) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
      <span style={{ fontSize: 48 }}>🎨</span>
      <p style={{ fontFamily: FONT, color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 8 }}>Color Master!</p>
      <div style={{ background: "linear-gradient(135deg,#3b82f6,#a855f7)", borderRadius: 20, padding: "10px 28px", display: "inline-block", marginTop: 8 }}>
        <p style={{ fontFamily: FONT, color: "#fff", fontSize: 30, fontWeight: 900, margin: 0 }}>{score} pts</p>
      </div>
      <p style={{ fontFamily: FONT, color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8 }}>{resultsRef.current.filter(r => r.correct).length}/10 सही जवाब</p>
    </motion.div>
  )

  return (
    <motion.div className="flex flex-col items-center gap-4 w-full"
      animate={wrongFlash ? { x: [-10, 10, -7, 7, 0] } : {}}
      transition={{ duration: 0.35 }}>
      <div className="w-full">
        <div className="flex justify-between mb-1.5">
          <span style={{ fontFamily: FONT, color: "rgba(255,255,255,0.4)", fontSize: 11 }}>सवाल {cur + 1}/10</span>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: time <= 5 ? "#f87171" : time <= 10 ? "#fbbf24" : "#c084fc" }}>{time}s</span>
        </div>
        <div style={{ width: "100%", height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <motion.div style={{ height: "100%", borderRadius: 99, background: time > 10 ? "#ec4899" : time > 5 ? "#f59e0b" : "#ef4444" }}
            animate={{ width: `${(time / 20) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>
      <div className="flex justify-end w-full">
        <span style={{ fontFamily: FONT, color: "#fff", fontWeight: 800, fontSize: 13 }}>{score} pts</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={cur} initial={{ y: 14, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -14, opacity: 0 }}
          style={{ width: "100%", borderRadius: 24, padding: "24px 20px", textAlign: "center", background: "rgba(10,5,25,0.9)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <p style={{ fontFamily: FONT, color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>इस word का INK रंग बताओ</p>
          <p style={{ fontFamily: FONT, fontSize: 52, fontWeight: 900, color: q.inkHex, margin: 0, lineHeight: 1, textShadow: `0 0 30px ${q.inkHex}60` }}>{q.word}</p>
          <p style={{ fontFamily: FONT, color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 10 }}>Word मत पढ़ो — सिर्फ रंग देखो 👀</p>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, width: "100%" }}>
        {q.opts.map(opt => {
          const isSel = selected === opt.name, isCorrect = opt.name === q.inkName
          let bg = `${opt.hex}14`, border = `${opt.hex}55`, textCol = "rgba(255,255,255,0.8)"
          if (selected) {
            if (isCorrect) { bg = "rgba(34,197,94,0.18)"; border = "#4ade80"; textCol = "#4ade80" }
            else if (isSel) { bg = "rgba(239,68,68,0.18)"; border = "#f87171"; textCol = "#f87171" }
          }
          return (
            <motion.button key={opt.name} onClick={() => answer(opt.name)} disabled={!!selected}
              style={{ fontFamily: FONT, background: bg, border: `1.5px solid ${border}`, color: textCol, borderRadius: 14, padding: "11px 8px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: selected ? "default" : "pointer" }}
              whileHover={!selected ? { scale: 1.06 } : {}} whileTap={!selected ? { scale: 0.93 } : {}}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.hex, boxShadow: `0 0 6px ${opt.hex}`, flexShrink: 0 }} />
              {opt.name}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
const GAMES = [
  { id: "song", label: "गाना पहचानो", sub: "सुनो, जल्दी बताओ — जल्दी = ज़्यादा pts!", emoji: "🎵", accent: "#a855f7", bg: "rgba(168,85,247,0.08)" },
  { id: "memory", label: "मेमोरी मैच", sub: "Flip करो और जोड़े मिलाओ", emoji: "🧠", accent: "#ec4899", bg: "rgba(236,72,153,0.08)" },
  { id: "color", label: "कलर मैच", sub: "Stroop — 20 सेकंड में 10 सवाल", emoji: "🎨", accent: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
]

export default function FunGames({ onComplete }) {
  const [active, setActive] = useState(null)
  const [scores, setScores] = useState({ memory: null, song: null, color: null })

  useEffect(() => {
    try {
      const s = localStorage.getItem("fg_scores_v3")
      if (s) setScores(JSON.parse(s))
    } catch { }
  }, [])

  const addScore = (id, s) => {
    const n = { ...scores, [id]: s }
    setScores(n)
    try { localStorage.setItem("fg_scores_v3", JSON.stringify(n)) } catch { }
  }

  const total = Object.values(scores).reduce((a, b) => a + (b ?? 0), 0)
  const allDone = Object.values(scores).every(s => s !== null)
  const playedCount = Object.values(scores).filter(s => s !== null).length

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
      paddingTop: 32, paddingBottom: 60, paddingLeft: 16, paddingRight: 16,
      position: "relative", overflow: "hidden",
      background: "linear-gradient(160deg,#0a0518 0%,#0f0620 50%,#0a0518 100%)"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        button { outline: none; border: none; }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(168,85,247,0.07),transparent 70%)", top: "-10%", left: "-15%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.07),transparent 70%)", bottom: "-5%", right: "-10%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.05),transparent 70%)", top: "40%", right: "5%", filter: "blur(40px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 380 }}>
        <AnimatePresence mode="wait">
          {!active ? (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}>
              {/* Header */}
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ textAlign: "center", marginBottom: 28 }}>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                  style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>🏆</motion.div>
                <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 32, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#f472b6,#c084fc,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Fun Games</h1>
                <p style={{ fontFamily: FONT, color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>Madam Jii के लिए 💕</p>

                {/* Score pill */}
                <motion.div
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "6px 18px" }}
                  animate={total > 0 ? { boxShadow: ["0 0 0px rgba(236,72,153,0)", "0 0 16px rgba(236,72,153,0.3)", "0 0 0px rgba(236,72,153,0)"] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity }}>
                  <span style={{ fontSize: 14 }}>⭐</span>
                  <span style={{ fontFamily: FONT, color: "#fff", fontWeight: 900, fontSize: 15 }}>{total} pts</span>
                  {playedCount > 0 && <span style={{ fontFamily: FONT, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{playedCount}/3 खेले</span>}
                </motion.div>
              </motion.div>

              {/* Game Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {GAMES.map((g, i) => (
                  <motion.button key={g.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    onClick={() => setActive(g.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
                      borderRadius: 22, textAlign: "left", cursor: "pointer",
                      background: scores[g.id] !== null ? "rgba(34,197,94,0.06)" : g.bg,
                      border: scores[g.id] !== null ? "1.5px solid rgba(34,197,94,0.35)" : `1.5px solid ${g.accent}30`,
                      boxShadow: scores[g.id] !== null ? "0 0 20px rgba(34,197,94,0.08)" : `0 0 20px ${g.accent}06`,
                      transition: "all 0.2s"
                    }}
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    {/* Emoji icon */}
                    <div style={{ width: 50, height: 50, borderRadius: 16, background: `${g.accent}15`, border: `1.5px solid ${g.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                      {scores[g.id] !== null ? "✅" : g.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: FONT, color: "#fff", fontWeight: 800, fontSize: 15, margin: 0 }}>{g.label}</p>
                      <p style={{ fontFamily: FONT, color: "rgba(255,255,255,0.4)", fontSize: 11, margin: 0, marginTop: 2 }}>{g.sub}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {scores[g.id] !== null ? (
                        <div>
                          <p style={{ fontFamily: FONT, color: "#4ade80", fontSize: 10, fontWeight: 700, margin: 0 }}>हो गया!</p>
                          <p style={{ fontFamily: FONT, color: "#fff", fontWeight: 900, fontSize: 20, margin: 0, lineHeight: 1.1 }}>{scores[g.id]}</p>
                        </div>
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 99, background: `${g.accent}15`, border: `1px solid ${g.accent}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ChevronRight size={14} color={g.accent} />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* All done */}
              <AnimatePresence>
                {allDone && onComplete && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ textAlign: "center", marginTop: 24 }}>
                    <p style={{ fontFamily: FONT, color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>🎉 सब games खत्म!</p>
                    <p style={{ fontFamily: DISPLAY_FONT, color: "#f472b6", fontSize: 32, fontWeight: 800, margin: "0 0 16px" }}>{total} pts</p>
                    <motion.button onClick={() => onComplete(total)}
                      style={{ fontFamily: FONT, background: "linear-gradient(135deg,#ec4899,#8b5cf6)", color: "#fff", fontWeight: 800, fontSize: 15, padding: "14px 32px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", boxShadow: "0 8px 30px rgba(236,72,153,0.4)" }}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                      animate={{ boxShadow: ["0 8px 20px rgba(236,72,153,0.3)", "0 8px 40px rgba(236,72,153,0.6)", "0 8px 20px rgba(236,72,153,0.3)"] }}
                      transition={{ duration: 2, repeat: Infinity }}>
                      आगे चलते हैं <ArrowRight size={18} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key={active} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              {/* Game header */}
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <motion.button onClick={() => setActive(null)}
                  style={{ fontFamily: FONT, color: "rgba(255,255,255,0.5)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "6px 14px", cursor: "pointer" }}
                  whileHover={{ color: "rgba(255,255,255,0.9)" }}
                  whileTap={{ scale: 0.95 }}>
                  ← वापस
                </motion.button>
                <p style={{ fontFamily: DISPLAY_FONT, color: "#fff", fontSize: 18, fontWeight: 700, margin: 0 }}>
                  {GAMES.find(g => g.id === active)?.label}
                </p>
                <div style={{ width: 70 }} />
              </div>

              {active === "song" && <SongGuessGame onScore={s => { addScore("song", s); setTimeout(() => setActive(null), 2500) }} />}
              {active === "memory" && <MemoryGame onScore={s => { addScore("memory", s); setTimeout(() => setActive(null), 2000) }} />}
              {active === "color" && <ColorMatchGame onScore={s => { addScore("color", s); setTimeout(() => setActive(null), 2000) }} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

