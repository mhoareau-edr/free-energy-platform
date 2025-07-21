import { useParams } from "react-router-dom";
import ChatFullScreen from "./components/Chat/ChatFullScreen";

export default function ChatRouteWrapper({ user }) {
  const { id } = useParams();

  return (
    <ChatFullScreen
      user={user}
      forcedUserId={parseInt(id)}
    />
  );
}
