import WhatsAppButton from "@/components/WhatsAppButton";
import TelegramButton from "@/components/TelegramButton";

export default function FloatingContactButtons({
  phone,
  telegramUsername,
}: {
  phone: string;
  telegramUsername: string;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <TelegramButton username={telegramUsername} />
      <WhatsAppButton phone={phone} />
    </div>
  );
}
