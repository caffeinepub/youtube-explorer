import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

actor {
  type Video = {
    id : Text;
    title : Text;
    channelName : Text;
    videoId : Text;
    category : Text;
  };

  type Message = {
    id : Text;
    role : Text; // "user" or "assistant"
    content : Text;
    timestamp : Int;
  };

  let featuredVideos = [
    {
      id = "1";
      title = "Taylor Swift - Shake It Off";
      channelName = "Taylor Swift";
      videoId = "nfWlot6h_JM";
      category = "Music";
    },
    {
      id = "2";
      title = "MrBeast - I Gave $1,000,000 To Random People";
      channelName = "MrBeast";
      videoId = "xDqkB6lGHVI";
      category = "Entertainment";
    },
    {
      id = "3";
      title = "NASA Live: Earth From Space";
      channelName = "NASA";
      videoId = "86YLFOog4GM";
      category = "Education";
    },
    {
      id = "4";
      title = "Ariana Grande - 7 rings";
      channelName = "Ariana Grande";
      videoId = "QYh6mYIJG2Y";
      category = "Music";
    },
    {
      id = "5";
      title = "PewDiePie - Minecraft Lets Play";
      channelName = "PewDiePie";
      videoId = "DqAyGWnQ-Bg";
      category = "Gaming";
    },
    {
      id = "6";
      title = "Soccer Highlights - Champions League Final";
      channelName = "Soccer Highlights";
      videoId = "xyz123";
      category = "Sports";
    },
    {
      id = "7";
      title = "Funny Cat Compilation";
      channelName = "Funny Pets";
      videoId = "dQw4w9WgXcQ";
      category = "Comedy";
    },
    {
      id = "8";
      title = "Fortnite Battle Royale Tips";
      channelName = "Fortnite Pro";
      videoId = "9bZkp7q19f0";
      category = "Gaming";
    },
    {
      id = "9";
      title = "Billie Eilish - Bad Guy";
      channelName = "Billie Eilish";
      videoId = "DyDfgMOUjCI";
      category = "Music";
    },
    {
      id = "10";
      title = "Stand-up Comedy Special";
      channelName = "Comedy Central";
      videoId = "7QU1nvuxaMA";
      category = "Comedy";
    },
    {
      id = "11";
      title = "Top 10 NBA Dunks";
      channelName = "NBA";
      videoId = "nba123";
      category = "Sports";
    },
    {
      id = "12";
      title = "How To Solve A Rubik's Cube";
      channelName = "J Perm";
      videoId = "R-R0KrXvWbc";
      category = "Education";
    },
  ];

  var messageCounter : Nat = 0;
  var chatHistory : List.List<Message> = List.empty<Message>();

  public query func getAllFeaturedVideos() : async [Video] {
    featuredVideos;
  };

  func matchesKeyword(text : Text, keyword : Text) : Bool {
    text.contains(#text(keyword));
  };

  public query func searchVideosByKeyword(keyword : Text) : async [Video] {
    if (keyword.trim(#char(' ')).size() == 0) {
      Runtime.trap("Keyword cannot be empty");
    };
    featuredVideos.values().filter(
      func(video) {
        matchesKeyword(video.title, keyword) or matchesKeyword(video.channelName, keyword);
      }
    ).toArray();
  };

  public query func getVideosByCategory(category : Text) : async [Video] {
    featuredVideos.values().filter(
      func(video) {
        Text.equal(video.category, category);
      }
    ).toArray();
  };

  // Chat functionality
  public shared ({ caller }) func sendMessage(userText : Text) : async Message {
    let userId : Text = "user-" # messageCounter.toText();

    let userMessage : Message = {
      id = userId;
      role = "user";
      content = userText;
      timestamp = Time.now();
    };

    chatHistory.add(userMessage);

    let replyText = pickCannedReply();
    let assistantId : Text = "assistant-" # messageCounter.toText();

    let assistantMessage : Message = {
      id = assistantId;
      role = "assistant";
      content = replyText;
      timestamp = Time.now();
    };

    chatHistory.add(assistantMessage);

    messageCounter += 1;
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
    responses[messageCounter % responses.size()];
  };

  public query ({ caller }) func getChatHistory() : async [Message] {
    chatHistory.toArray();
  };

  public shared ({ caller }) func clearChatHistory() : async () {
    chatHistory.clear();
  };
};
