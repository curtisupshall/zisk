import { DownstreamFilter } from "@/contexts/JournalSnapshopContext"; 

self.onmessage = function (e: MessageEvent<DownstreamFilter[]>) {
  const records = e.data;
  self.postMessage(records);
};

export {};
