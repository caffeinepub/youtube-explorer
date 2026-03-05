import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    id: MessageId;
    content: string;
    role: string;
    timestamp: bigint;
}
export type Time = bigint;
export type MessageId = bigint;
export interface Post {
    id: PostId;
    content: string;
    author: string;
    timestamp: Time;
}
export type PostId = bigint;
export interface backendInterface {
    clearChatHistory(): Promise<void>;
    createPost(author: string, content: string): Promise<void>;
    getAllPosts(): Promise<Array<Post>>;
    getAllPreferences(): Promise<Array<[string, string]>>;
    getChatHistory(): Promise<Array<ChatMessage>>;
    getLikedPostsByUser(userId: Principal): Promise<Array<PostId>>;
    getPreference(key: string): Promise<string | null>;
    hasUserLikedPost(userId: Principal, postId: PostId): Promise<boolean>;
    sendMessage(userText: string): Promise<ChatMessage>;
    setPreference(key: string, value: string): Promise<void>;
    toggleLikePost(postId: PostId): Promise<boolean>;
}
