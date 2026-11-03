import "dotenv/config";
import { connectDatabase, getDatabase } from "../config/database.js";

const sampleStudios = [
  { title: "Golden Hour Photo Studio", category: "Photo Studio", hourlyRate: 45, securityDeposit: 50, maxCapacity: 8, location: "Gulshan, Dhaka", imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200", overview: "A bright portrait studio with soft natural light, clean backdrops and room for a small creative team.", amenities: ["Lighting equipment", "Makeup station", "Air conditioning"], ownerName: "StudioSpace Demo Host", ownerEmail: "demo-host@studiospace.test", ownerId: "demo-host", rating: 4.9, reviewCount: 12 },
  { title: "The Sound Loft", category: "Podcast Lounge", hourlyRate: 35, securityDeposit: 30, maxCapacity: 5, location: "Dhanmondi, Dhaka", imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200", overview: "A comfortable podcast room with acoustic treatment and a calm recording atmosphere.", amenities: ["Soundproofing", "Wi-Fi", "Air conditioning"], ownerName: "StudioSpace Demo Host", ownerEmail: "demo-host@studiospace.test", ownerId: "demo-host", rating: 4.8, reviewCount: 8 },
  { title: "Frame One Production Stage", category: "Film Stage", hourlyRate: 80, securityDeposit: 100, maxCapacity: 20, location: "Tejgaon, Dhaka", imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200", overview: "An adaptable production stage for interviews, product shoots and small film projects.", amenities: ["Green screen", "Lighting equipment", "Parking"], ownerName: "StudioSpace Demo Host", ownerEmail: "demo-host@studiospace.test", ownerId: "demo-host", rating: 4.9, reviewCount: 15 },
  { title: "Echo Music Suite", category: "Music Suite", hourlyRate: 40, securityDeposit: 40, maxCapacity: 6, location: "Uttara, Dhaka", imageUrl: "https://images.unsplash.com/photo-1593078166038-6c7c8a1f8c10?w=1200", overview: "A compact music room for rehearsals, demos and independent recording sessions.", amenities: ["Soundproofing", "Air conditioning", "Wi-Fi"], ownerName: "StudioSpace Demo Host", ownerEmail: "demo-host@studiospace.test", ownerId: "demo-host", rating: 4.7, reviewCount: 6 },
  { title: "Clay & Canvas Workshop", category: "Workshop", hourlyRate: 25, securityDeposit: 20, maxCapacity: 12, location: "Banani, Dhaka", imageUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200", overview: "A welcoming hands-on workshop for art classes, craft sessions and small group projects.", amenities: ["Wi-Fi", "Air conditioning", "Parking"], ownerName: "StudioSpace Demo Host", ownerEmail: "demo-host@studiospace.test", ownerId: "demo-host", rating: 4.8, reviewCount: 10 },
  { title: "North Light Creative Room", category: "Photo Studio", hourlyRate: 30, securityDeposit: 25, maxCapacity: 4, location: "Mohammadpur, Dhaka", imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200", overview: "A minimal daylight room for product photography, portraits and creative content.", amenities: ["Lighting equipment", "Green screen", "Wi-Fi"], ownerName: "StudioSpace Demo Host", ownerEmail: "demo-host@studiospace.test", ownerId: "demo-host", rating: 4.6, reviewCount: 4 }
];

async function seed() {
  try {
    await connectDatabase();
    const collection = getDatabase().collection("studios");
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log("Studios collection already has data. No sample data was added.");
      return;
    }
    const now = new Date();
    await collection.insertMany(sampleStudios.map((studio) => ({ ...studio, createdAt: now })));
    console.log("Added six sample StudioSpace listings.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}
seed();
