const db = require("../models");

async function deleteAllBriefs() {
  try {
    console.log("Starting to delete all briefs and brief details...");
    
    // Delete all BriefDetails first (due to foreign key constraint)
    const deletedDetails = await db.BriefDetail.destroy({
      where: {},
      force: true, // Hard delete
    });
    console.log(`Deleted ${deletedDetails} brief details`);
    
    // Delete all Briefs
    const deletedBriefs = await db.Brief.destroy({
      where: {},
      force: true, // Hard delete
    });
    console.log(`Deleted ${deletedBriefs} briefs`);
    
    console.log("All briefs and brief details have been deleted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error deleting briefs:", error);
    process.exit(1);
  }
}

deleteAllBriefs();

