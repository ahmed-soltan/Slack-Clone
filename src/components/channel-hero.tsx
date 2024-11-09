import { format } from "date-fns";

interface ChannelHeroProps {
  channelName: string;
  channelCreationTime: number;
}

const ChannelHero = ({
  channelName,
  channelCreationTime,
}: ChannelHeroProps) => {
  return (
    <div className="mt-[80px] mx-5 mb-4">
      <p className="text-2xl font-bold flex items-center mb-2">
        # {channelName}
      </p>
      <p className="font-normal text-slate-800 mb-4">
        This Channel Was Created on
        {format(channelCreationTime, "MMMM do, yyyy")}. This is the very
        beginning of <strong>{channelName}</strong> channel.
      </p>
    </div>
  );
};

export default ChannelHero;
