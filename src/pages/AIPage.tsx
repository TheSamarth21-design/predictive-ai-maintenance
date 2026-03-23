import AIChat from '@/components/syncplant/AIChat';

export default function AIPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">AI Assistant</h2>
        <p className="text-muted-foreground text-sm">Ask questions about machine health, risks, costs, and maintenance scheduling</p>
      </header>
      <AIChat fullPage />
    </div>
  );
}
