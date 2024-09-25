import Image from "next/image";

interface ProfileImageProps {
  image: string | null;
}

const placeholderUrl = "https://via.placeholder.com/100";

const ProfileImage: React.FC<ProfileImageProps> = ({ image }) => {
  return (
    <div className="mb-4">
      <Image
        src={image || placeholderUrl}
        alt="User Profile Image"
        width={100}
        height={100}
        className="rounded-full mx-auto"
      />
    </div>
  );
};

export default ProfileImage;
