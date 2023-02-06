// upload imageBuffer to cloudinary
import cloudinaryConfig from "../configs/cloudnaryConfig";

export const uploadImage = async (image: any) => {
  const imageBuffer = image.tempFilePath;

  const imageUpload = await cloudinaryConfig.uploader.upload(imageBuffer, {
    upload_preset: `${process.env.CLOUDINARY_UPLOAD_PRESET}`,
  });

  return imageUpload.secure_url;
};

// delete image from cloudinary using url

export const deleteImage = async (imageUrl: string) => {
  const fileName: string = imageUrl.split("/").pop() as string;

  const id = fileName.split(".")[0];

  const deletedImage = await cloudinaryConfig.uploader.destroy(
    id,
    function (error, result) {
      if (error) return error;

      return result;
    }
  );

  return deletedImage;
};
