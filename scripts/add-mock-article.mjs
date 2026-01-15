import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-Vq8QYCXT-m0QrJdgMaMUmrrp_4ZChxQ",
  authDomain: "vantagepost-11276.firebaseapp.com",
  projectId: "vantagepost-11276",
  storageBucket: "vantagepost-11276.firebasestorage.app",
  messagingSenderId: "228569019260",
  appId: "1:228569019260:web:df82b25847747b98f76af9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const article = {
  title: "Remittances in India: The $129 Billion Lifeline",
  excerpt: "India received $129 billion in remittances in 2023—the highest globally. These transfers from overseas workers represent 3.4% of India's GDP and function as vital financial support for millions of families.",
  content: `## Overview

India received **$129 billion** in remittances in 2023—the highest globally. These transfers from overseas workers represent **3.4% of India's GDP** and function as vital financial support for millions of families.

## Key Statistics

Remittance inflows have surged dramatically: from **$2 billion in 1990** to **$129 billion in 2023**. The United States is the largest source (23.4%), followed by the UAE (18%), with the UK and Saudi Arabia contributing smaller shares at 6.8% and 5.1% respectively.

A notable shift has occurred: Gulf region remittances dropped from over 50% (2016-17) to 30-35% (2020-21), while high-skilled migration to Western nations has increased.

## Geographic Distribution

Maharashtra leads in receiving remittances (35.2%), trailed by Kerala (10.2%), Tamil Nadu (9.7%), and Delhi (9.3%). These states also experience significant emigration of skilled professionals.

## Household Spending Patterns

Remittance-receiving families allocate funds toward:

- Daily essentials and utilities (30% of consumption)
- Education and school fees
- Healthcare and medical expenses
- Housing construction and repairs
- Social ceremonies and weddings
- Savings and debt repayment

Studies indicate **"38% of remittance-receiving households reported economic improvement"** versus 33% of non-recipient households.

## Economic Paradoxes

**Positive impacts:** Remittances ease India's current account deficit and comprised **"over 60% of India's net private capital flows"** in 2022.

**Challenges:** Funds often fuel real estate speculation and inflation rather than productive investment. Additionally, brain drain resulting from high-skilled emigration may hinder domestic innovation despite strengthening foreign exchange reserves.

## Transaction Costs

Remittance fees have risen significantly, climbing from approximately 3% in 2017 to around 7% in 2021, reducing recipient household income.

## Conclusion

While remittances provide essential family support, sustained national growth requires policies that lower transfer costs, promote financial inclusion, and encourage productive investments rather than speculative spending.`,
  author: "Vantage Post",
  date: Timestamp.now(),
  readTime: "5 min read",
  type: "writeup",
  imageUrl: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=1200&h=800&fit=crop",
};

const ARTICLES_PATH = 'artifacts/macro-insights/public/data/articles';

async function addArticle() {
  try {
    const articlesRef = collection(db, ARTICLES_PATH);
    const docRef = await addDoc(articlesRef, article);
    console.log('Article added successfully with ID:', docRef.id);
    process.exit(0);
  } catch (error) {
    console.error('Error adding article:', error);
    process.exit(1);
  }
}

addArticle();
