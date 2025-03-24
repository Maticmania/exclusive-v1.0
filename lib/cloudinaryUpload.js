import cloudinary from "cloudinary"

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload a single image
export async function uploadSingleImage(base64String) {
  try {
    const uploadedResponse = await cloudinary.v2.uploader.upload(base64String, {
      folder: "products",
      resource_type: "image",
    })
    return uploadedResponse.secure_url
  } catch (error) {
    console.error("Cloudinary Upload Error:", error)
    throw new Error("Image upload failed")
  }
}

// Upload multiple images
export async function uploadMultipleImages(files) {
  try {
    if (!files || files.length === 0) return []
    return await Promise.all(files.map((file) => uploadSingleImage(file)))
  } catch (error) {
    console.error("Multiple Image Upload Error:", error)
    throw new Error("Image uploads failed")
  }
}

// Delete an image from Cloudinary
export async function deleteImageFromCloudinary(imageUrl) {
  try {
    // Extract public_id correctly (folder + filename without extension)
    const urlParts = imageUrl.split("/")
    const filename = urlParts[urlParts.length - 1].split(".")[0] // Extract file name without extension
    const folder = urlParts[urlParts.length - 2] // Get the folder name
    const publicId = `${folder}/${filename}` // Correct format: "categories/image-name"

    await cloudinary.v2.uploader.destroy(publicId)

    console.log(`Deleted image: ${publicId}`)
  } catch (error) {
    console.error("Cloudinary Delete Error:", error)
  }
}
