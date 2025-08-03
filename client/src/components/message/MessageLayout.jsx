// MessageLayout.js
import { PanelResizeHandle, Panel, PanelGroup } from "react-resizable-panels";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedContact } from "../../store/chatSlice";
import MessageSidebar from "./MessageSidebar";
import MessageHeader from "./MessageHeader";
import MessageChat from "./MessageChat";

const MessageLayout = () => {
  const { selectedContactId, otherUserId } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const handleContactSelect = ({ conversationId, otherUserId }) => {
    console.log(
      "MessageLayout: Selecting contact with conversationId:",
      conversationId,
      "otherUserId:",
      otherUserId
    );
    if (conversationId && otherUserId) {
      dispatch(setSelectedContact({ conversationId, otherUserId }));
    } else {
      console.warn("MessageLayout: Invalid conversationId or otherUserId");
    }
  };

  const handleBackToSidebar = () => {
    dispatch(setSelectedContact({ conversationId: null, otherUserId: null }));
  };

  const handleClearSelection = () => {
    dispatch(setSelectedContact({ conversationId: null, otherUserId: null }));
  };

  return (
    <div data-theme="night" className="flex w-full h-full overflow-hidd">
      {/* Mobile Layout */}
      <div className="md:hidden w-full h-full">
        {!otherUserId ? (
          <MessageSidebar
            onContactSelect={handleContactSelect}
            selectedContactId={selectedContactId}
          />
        ) : (
          <div className="flex flex-col w-full h-full">
            <div className="flex-shrink-0">
              <MessageHeader
                selectedContactId={otherUserId} // Pass otherUserId
                onBackClick={handleBackToSidebar}
                showBackButton={true}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <MessageChat selectedContactId={otherUserId} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex w-full h-full">
        <PanelGroup direction="horizontal" className="w-full h-full">
          <Panel
            defaultSize={30}
            minSize={20}
            maxSize={30}
            className="flex-shrink-0"
          >
            <MessageSidebar
              onContactSelect={handleContactSelect}
              selectedContactId={selectedContactId}
            />
          </Panel>

          <PanelResizeHandle className=" hover:bg-blue-300 transition-colors duration-200 cursor-col-resize active:bg-blue-400" />

          <Panel
            defaultSize={70}
            minSize={50}
            className="flex flex-col bg-gray-50"
          >
            {otherUserId ? (
              <>
                <div className="flex-shrink-0">
                  <MessageHeader
                    selectedContactId={otherUserId}
                    onBackClick={handleClearSelection}
                    showBackButton={false}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageChat selectedContactId={otherUserId} />
                </div>
              </>
            ) : (
              <WelcomeScreen />
            )}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

const WelcomeScreen = () => (
  <div data-theme="night" className="flex items-center justify-center h-full">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold  mb-3">
        Welcome to Messages
      </h2>
      <p className="text-gray-600 leading-relaxed">
        Select a conversation from the sidebar to start chatting. All your
        messages will appear here.
      </p>
    </div>
  </div>
);

export default MessageLayout;
