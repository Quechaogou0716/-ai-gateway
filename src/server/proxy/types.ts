export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}
