import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { seedParameterReferences } from "./seeds/parameterSeeder.js";

// Load env vars
dotenv.config();

// Connect to database and seed
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("📦 Starting parameter reference seeding...\n");

    // Seed parameters
    const result = await seedParameterReferences();

    console.log(`\n✅ Seeding completed successfully!`);
    console.log(`📊 Total parameters: ${result.count}`);
    console.log("\n🎉 Your system is ready to use!\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
