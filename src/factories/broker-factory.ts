import config from "config";
import { KafkaBroker } from "../config/kafka";
import { MessageBroker } from "../types/broker";

let broker: MessageBroker | null = null;

export const createMessageBroker = (): MessageBroker => {
  console.log("connecting to kafka broker...");
  // singleton
  if (!broker) {
    broker = new KafkaBroker("web-socket-service", [
      config.get("kafka.broker"),
    ]);
  }
  return broker;
};
