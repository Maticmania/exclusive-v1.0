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
    // Only delete images hosted on Cloudinary
    if (!imageUrl.includes("res.cloudinary.com")) return

    const publicId = imageUrl.split("/").pop().split(".")[0] // Extract public_id
    await cloudinary.v2.uploader.destroy(`products/${publicId}`)

    console.log("Image deleted from Cloudinary:", publicId)
  } catch (error) {
    console.error("Cloudinary Delete Error:", error)
  }
}
