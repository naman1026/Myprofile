'use server';

import { getCollection } from '@/lib/mongodb';
import { portfolioDataSchema, PortfolioData, defaultPortfolioData } from '@/lib/portfolio-schema';
import { revalidatePath } from 'next/cache';
import { Collection } from 'mongodb';

// Ensure collection name is consistent
const COLLECTION_NAME = 'portfolioContent';

// Function to get the portfolio collection
async function getPortfolioCollection(): Promise<Collection<PortfolioData>> {
  // We type the collection with PortfolioData, assuming the data structure matches
  return getCollection<PortfolioData>(COLLECTION_NAME);
}

/**
 * Fetches the portfolio data from the database.
 * If no data exists, it initializes with default data.
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  try {
    const collection = await getPortfolioCollection();
    let data = await collection.findOne({ identifier: 'main' });

    if (!data) {
      console.log('No portfolio data found, initializing with default data.');
      // Insert default data if the collection is empty or the main document doesn't exist
      const insertResult = await collection.insertOne({
        identifier: 'main',
        ...defaultPortfolioData,
      });
      // Fetch the newly inserted document
      data = await collection.findOne({ _id: insertResult.insertedId });
      if (!data) {
        throw new Error('Failed to insert or retrieve default portfolio data.');
      }
    }

    // Validate the fetched data against the schema
    const validatedData = portfolioDataSchema.safeParse(data);
    if (!validatedData.success) {
        console.error("Data validation failed:", validatedData.error.flatten());
        // Handle validation failure - maybe return default data or throw a specific error
        // For now, let's return the potentially invalid data but log the error
        // In a production scenario, you might want stricter handling
        console.warn("Returning potentially invalid data from DB due to validation failure.");
        // return defaultPortfolioData; // Option: return default if validation fails
    }

    // Convert ObjectId to string for client-side compatibility if needed
    // Zod schema's `any()` for _id handles this, but explicit conversion might be safer
    // if (!validatedData.success) // If validation failed, we might be dealing with raw data
    if (data._id && typeof data._id !== 'string') {
        data._id = data._id.toString();
    }


    // Return the validated data or the raw data if validation failed but we decided to proceed
    return validatedData.success ? validatedData.data : data as PortfolioData;

  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    // Fallback to default data in case of any error during DB fetch/initialization
    return { ...defaultPortfolioData, identifier: 'main' };
  }
}


/**
 * Updates the portfolio data in the database.
 * Requires admin authentication (password check).
 */
export async function updatePortfolioData(
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: PortfolioData }> {
  const password = formData.get('adminPassword') as string;
  const dataString = formData.get('portfolioData') as string; // Expecting JSON string

  // Basic password check - enhance security in production (e.g., hashing)
  if (password !== process.env.ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid admin password.' };
  }

  if (!dataString) {
      return { success: false, error: 'Portfolio data is missing.' };
  }

  let portfolioData: Partial<PortfolioData>;
  try {
    portfolioData = JSON.parse(dataString);
    // Remove _id and identifier from the update payload as we update based on identifier
    delete portfolioData._id;
    delete portfolioData.identifier;
  } catch (e) {
    return { success: false, error: 'Invalid data format. Expected JSON.' };
  }


  // Validate the incoming data (excluding _id and identifier)
   const validationSchema = portfolioDataSchema.omit({ _id: true, identifier: true });
   const validationResult = validationSchema.safeParse(portfolioData);


  if (!validationResult.success) {
    console.error("Update validation failed:", validationResult.error.flatten());
    return { success: false, error: 'Invalid data structure.', /* details: validationResult.error.flatten() */ };
  }

  try {
    const collection = await getPortfolioCollection();
    const result = await collection.updateOne(
      { identifier: 'main' }, // Filter to update the main document
      { $set: validationResult.data }, // Use the validated data for the update
      { upsert: true } // Create the document if it doesn't exist
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
       throw new Error('Failed to update or upsert portfolio data.');
    }

    // Revalidate the homepage path to reflect changes immediately
    revalidatePath('/');
    revalidatePath('/admin'); // Also revalidate admin if needed

    // Fetch the updated data to return it
    const updatedData = await getPortfolioData();

    return { success: true, data: updatedData };

  } catch (error) {
    console.error('Error updating portfolio data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Database operation failed: ${errorMessage}` };
  }
}
