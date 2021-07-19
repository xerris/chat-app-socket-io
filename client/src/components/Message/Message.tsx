import React from "react";
import "./Message.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(timezone);

interface Props {
  timestamp: string;
  message: string;
  username: string;
}

const Message: React.FC<Props> = ({ timestamp, message, username }: Props) => {
  return (
    <div className="message" key={timestamp}>
      <span className="username">
        {username} <i>{dayjs(timestamp, "UTC").local().fromNow()}</i>
      </span>
      <span className="messageContent">{message}</span>
    </div>
  );
};

export default Message;
