import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: string;
    title: string;
    channelName: string;
    category: string;
    videoId: string;
}
export interface Message {
    id: string;
    content: string;
    role: string;
    timestamp: bigint;
}
export interface backendInterface {
    clearChatHistory(): Promise<void>;
    getAllFeaturedVideos(): Promise<Array<Video>>;
    getChatHistory(): Promise<Array<Message>>;
    getVideosByCategory(category: string): Promise<Array<Video>>;
    searchVideosByKeyword(keyword: string): Promise<Array<Video>>;
    sendMessage(userText: string): Promise<Message>;
}
