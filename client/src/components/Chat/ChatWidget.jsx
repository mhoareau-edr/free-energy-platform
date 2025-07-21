import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatFullScreen from "./ChatFullScreen";

export default function ChatWidget({ user, showMessages }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (showMessages && isOpen) {
      setIsOpen(false);
    }
  }, [showMessages]);

  if (showMessages) return null;

  return (
    <>
      <div className="fixed bottom-0 right-8 z-50 ">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-white px-4 py-2 hover:bg-primary-dark transition w-[350px] h-[50px] rounded-tl-xl rounded-tr-xl shadow-lg"
          >
            Messages
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-popup"
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 800 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 right-8 z-50 h-[750px] w-[800px] bg-white flex flex-col overflow-hidden shadow-xl rounded-tl-xl rounded-tr-xl dark:bg-[#1d2125] dark:border-0"
          >
            <div
              className="bg-primary text-white px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-semibold text-sm">Messagerie</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatFullScreen user={user} isMini={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
