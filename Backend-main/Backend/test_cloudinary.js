const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

async function testCloudinary() {
    console.log('Testing Cloudinary configuration...\n');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME?.trim());
    console.log('API Key:', process.env.CLOUDINARY_API_KEY?.trim());
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***configured***' : 'NOT SET');
    console.log('\n');

    try {
        // Test with a simple base64 image (1x1 transparent PNG)
        const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

        console.log('Attempting to upload test image to Cloudinary...');
        const result = await cloudinary.uploader.upload(testImage, {
            folder: 'sust-cse/test',
            resource_type: 'image',
        });

        console.log('\n✅ SUCCESS! Cloudinary is working correctly!');
        console.log('\nUpload Details:');
        console.log('  - URL:', result.secure_url);
        console.log('  - Public ID:', result.public_id);
        console.log('  - Format:', result.format);
        console.log('  - Width:', result.width);
        console.log('  - Height:', result.height);

        // Clean up test image
        console.log('\nCleaning up test image...');
        await cloudinary.uploader.destroy(result.public_id);
        console.log('✅ Test image deleted successfully');

        console.log('\n🎉 Cloudinary is ready to use for profile picture uploads!');
        return true;
    } catch (error) {
        console.error('\n❌ ERROR: Cloudinary upload failed');
        console.error('Error Message:', error.message);
        console.error('HTTP Code:', error.http_code);
        console.error('\nFull Error:', error);
        return false;
    }
}

testCloudinary()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
