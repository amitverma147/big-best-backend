import { supabase } from "./config/supabaseClient.js";

async function createBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('profile-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error && error.message !== 'Bucket already exists') {
      console.error('Error creating bucket:', error);
    } else {
      console.log('✅ Bucket created successfully or already exists');
    }
  } catch (err) {
    console.error('Bucket creation failed:', err);
  }
}

createBucket();