import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ConversationHeroProps {
  name?: string;
  image?: string;
}

const ConversationHero = ({ name, image }: ConversationHeroProps) => {
  const avatarFallback = name?.charAt(0).toUpperCase();

  return (
    <div className="mt-[80px] mx-5 mb-4">
      <div className="flex items-center gap-x-2">
        <Avatar className="size-14 mr-2">
          <AvatarImage src={image} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <p className="text-2xl font-bold">{name}</p>
      </div>
      <p className="font-normal text-slate-800 my-4">
        This Conversation is Just Between you and {" "}
        <strong>{name}</strong>.
      </p>
    </div>
  );
};

export default ConversationHero;
