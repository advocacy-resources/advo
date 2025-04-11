import Image from "next/image";

interface ProfileImageProps {
  image: string | null;
  size?: number;
  className?: string;
}

const placeholderUrl = "https://via.placeholder.com/100";

/**
 * Component to display a user's profile image
 * Handles both local paths (/uploads/...) and cloud storage URLs (https://...)
 */
const ProfileImage: React.FC<ProfileImageProps> = ({
  image,
  size = 100,
  className = "rounded-full mx-auto",
}) => {
  // Determine if the image is a cloud storage URL or a local path
  const isCloudUrl =
    image && (image.startsWith("http://") || image.startsWith("https://"));
  const imageSrc = image || placeholderUrl;

  return (
    <div className="mb-4">
      <Image
        src={imageSrc}
        alt="User Profile Image"
        width={size}
        height={size}
        className={className}
        // Don't optimize external URLs (cloud storage)
        unoptimized={!!isCloudUrl}
      />
    </div>
  );
};

export default ProfileImage;
