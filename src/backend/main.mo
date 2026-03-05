import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";



actor {
  type PostId = Nat;

  type Post = {
    id : PostId;
    author : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type MessageId = Nat;
  type ChatMessage = {
    id : MessageId;
    role : Text; // "user" or "assistant"
    content : Text;
    timestamp : Int;
  };

  // Posts
  var nextPostId : PostId = 1;
  let posts = Map.empty<PostId, Post>();

  // Liked posts by user (canister principal as Text -> PostId Set)
  let likesByUser = Map.empty<Principal, Set.Set<PostId>>();

  // Gauth AI Chat
  var nextMessageId : MessageId = 1;
  let chatHistory = Map.empty<Principal, List.List<ChatMessage>>();

  // App preferences (simple Text -> Text store)
  let appPreferences = Map.empty<Text, Text>();

  // Post Functions

  public shared ({ caller }) func createPost(author : Text, content : Text) : async () {
    let post : Post = {
      id = nextPostId;
      author;
      content;
      timestamp = Time.now();
    };
    posts.add(nextPostId, post);
    nextPostId += 1;
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.values().toArray();
  };

  // Like/Unlike Post
  public shared ({ caller }) func toggleLikePost(postId : PostId) : async Bool {
    let user = caller;
    if (Principal.equal(user, Principal.fromText("2vxsx-fae"))) {
      Runtime.trap("Anonymous users cannot like posts. Please create a canister or use an II")
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (_) {
        let currentLikes = switch (likesByUser.get(user)) {
          case (null) { Set.empty<PostId>() };
          case (?likes) { likes };
        };

        let alreadyLiked = currentLikes.contains(postId);

        let updatedLikes = Set.empty<PostId>();
        currentLikes.values().forEach(
          func(existingPostId) {
            if (existingPostId != postId) {
              updatedLikes.add(existingPostId);
            };
          }
        );

        if (not alreadyLiked) {
          updatedLikes.add(postId);
        };

        likesByUser.add(user, updatedLikes);
        not alreadyLiked;
      };
    };
  };

  public query ({ caller }) func getLikedPostsByUser(userId : Principal) : async [PostId] {
    switch (likesByUser.get(userId)) {
      case (null) { [] };
      case (?likes) { likes.toArray() };
    };
  };

  public query ({ caller }) func hasUserLikedPost(userId : Principal, postId : PostId) : async Bool {
    switch (likesByUser.get(userId)) {
      case (null) { false };
      case (?likes) { likes.contains(postId) };
    };
  };

  // Gauth AI Chat Functions

  public shared ({ caller }) func sendMessage(userText : Text) : async ChatMessage {
    let userMessage : ChatMessage = {
      id = nextMessageId;
      role = "user";
      content = userText;
      timestamp = Time.now();
    };

    let existingHistory = switch (chatHistory.get(caller)) {
      case (null) { List.empty<ChatMessage>() };
      case (?history) { history };
    };

    // Add user message to history first
    existingHistory.add(userMessage);

    let replyText = pickCannedReply();
    let assistantMessage : ChatMessage = {
      id = nextMessageId + 1;
      role = "assistant";
      content = replyText;
      timestamp = Time.now();
    };

    // Add assistant message to history
    existingHistory.add(assistantMessage);

    chatHistory.add(caller, existingHistory);

    nextMessageId += 2;
    assistantMessage;
  };

  func pickCannedReply() : Text {
    let responses = [
      "That's interesting! Tell me more.",
      "I'm here to help! What else would you like to know?",
      "Great question! I'm thinking about that...",
      "Sure! What can I do for you today?",
      "Sounds good! How can I assist further?",
    ];
    responses[nextMessageId % responses.size()];
  };

  public query ({ caller }) func getChatHistory() : async [ChatMessage] {
    switch (chatHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history.reverse().toArray() };
    };
  };

  public shared ({ caller }) func clearChatHistory() : async () {
    chatHistory.remove(caller);
  };

  // App Preferences

  public shared ({ caller }) func setPreference(key : Text, value : Text) : async () {
    appPreferences.add(key, value);
  };

  public query ({ caller }) func getPreference(key : Text) : async ?Text {
    appPreferences.get(key);
  };

  public query ({ caller }) func getAllPreferences() : async [(Text, Text)] {
    appPreferences.toArray();
  };
};
