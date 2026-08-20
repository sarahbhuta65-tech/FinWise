// ===============================================================
// ONE-TIME CLEANUP SCRIPT
// ===============================================================
//
// Why you need this:
// The new Goal.js has `unique: true` on the `user` field. If your
// database already has duplicate Goal documents for the same user
// (which is the bug we're fixing), MongoDB will REFUSE to build
// that unique index and your server may fail to start / log an
// index error.
//
// Run this script ONCE, before deploying the updated Goal.js and
// goalController.js, to:
//   1. Find users who have more than one Goal document.
//   2. Keep the newest one (most recently updated), delete the rest.
//   3. Delete any FinancialSummary "savings" items that point to a
//      goal _id that no longer exists (orphans from old duplicates).
//
// HOW TO RUN:
//   1. Put this file anywhere in your backend project (e.g. /scripts).
//   2. Update MONGO_URI below (or make sure it reads from your .env).
//   3. From your backend folder, run:
//        node scripts/cleanupDuplicateGoals.js
//   4. Read the console output carefully before trusting it blindly.
// ===============================================================

const mongoose = require("mongoose");
require("dotenv").config();

// Adjust this if your .env uses a different variable name
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const Goal = require("../models/Goal");
const FinancialSummary = require("../models/FinancialSummary");

const run = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error(
                "No Mongo connection string found. Set MONGO_URI (or MONGODB_URI) in your .env."
            );
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.\n");

        // -----------------------------------------------------
        // STEP 1: Find users with more than one Goal document
        // -----------------------------------------------------
        const duplicateGroups = await Goal.aggregate([
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 },
                    goals: {
                        $push: {
                            id: "$_id",
                            updatedAt: "$updatedAt",
                            goalName: "$goalName",
                        },
                    },
                },
            },
            { $match: { count: { $gt: 1 } } },
        ]);

        if (duplicateGroups.length === 0) {
            console.log("No duplicate Goal documents found. Nothing to clean up here.\n");
        } else {
            console.log(
                `Found ${duplicateGroups.length} user(s) with duplicate Goal documents:\n`
            );

            for (const group of duplicateGroups) {
                console.log(`User: ${group._id}`);
                group.goals.forEach((g) =>
                    console.log(
                        `   - Goal ${g.id} | "${g.goalName}" | last updated: ${g.updatedAt}`
                    )
                );

                // Keep the most recently updated goal, delete the rest
                const sorted = [...group.goals].sort(
                    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                );

                const keep = sorted[0];
                const toDelete = sorted.slice(1);

                console.log(`   → Keeping: ${keep.id}`);

                for (const g of toDelete) {
                    console.log(`   → Deleting duplicate goal: ${g.id}`);
                    await Goal.deleteOne({ _id: g.id });
                }

                console.log("");
            }
        }

        // -----------------------------------------------------
        // STEP 2: Delete orphaned FinancialSummary "savings" items
        // (items whose sourceId no longer points to any Goal)
        // -----------------------------------------------------
        const remainingGoalIds = (await Goal.find({}, "_id")).map((g) =>
            g._id.toString()
        );

        const savingsItems = await FinancialSummary.find({
            source: "savings",
        });

        const orphanIds = savingsItems
            .filter((item) => !remainingGoalIds.includes(item.sourceId?.toString()))
            .map((item) => item._id);

        if (orphanIds.length === 0) {
            console.log("No orphaned FinancialSummary savings entries found.\n");
        } else {
            console.log(
                `Found ${orphanIds.length} orphaned FinancialSummary savings entr${
                    orphanIds.length === 1 ? "y" : "ies"
                }. Deleting...\n`
            );
            await FinancialSummary.deleteMany({ _id: { $in: orphanIds } });
        }

        console.log("Cleanup complete. It is now safe to deploy the updated Goal.js with the unique index.");

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error("Cleanup script failed:", error);
        process.exit(1);
    }
};

run();