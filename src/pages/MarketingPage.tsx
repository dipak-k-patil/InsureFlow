import { motion } from "framer-motion";
import { Sparkles, Image, Presentation, Video } from "lucide-react";
import { AiImageStudio } from "@/components/AiImageStudio";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WhatsAppBannerGenerator } from "@/components/WhatsAppBannerGenerator";

const tools = [
  { title: "AI Post Generator", desc: "Generate engaging social media posts for insurance products using AI", icon: Sparkles, gradient: "from-primary/20 to-secondary/20" },
  { title: "Festival Banners", desc: "Create beautiful festival greeting templates with your branding", icon: Image, gradient: "from-warning/20 to-destructive/20" },
  { title: "PPT Generator", desc: "Auto-generate professional presentations for client meetings", icon: Presentation, gradient: "from-success/20 to-primary/20" },
  { title: "Video Scripts", desc: "AI-powered video scripts for insurance marketing campaigns", icon: Video, gradient: "from-secondary/20 to-info/20" },
];

export default function MarketingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Marketing Suite</h1>
        <p className="text-muted-foreground mt-1">Create AI-generated marketing visual banners, custom insurance copy & WhatsApp assets</p>
      </div>

      <Tabs defaultValue="ai-studio" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="ai-studio" className="gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Image Content Studio
          </TabsTrigger>
          <TabsTrigger value="quick-banners" className="gap-2">
            <Image className="w-4 h-4" /> Quick Banner Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-studio" className="mt-0">
          <AiImageStudio />
        </TabsContent>

        <TabsContent value="quick-banners" className="mt-0 space-y-8">
          <WhatsAppBannerGenerator />

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Other Marketing AI Generators (Roadmap)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {tools.map((tool, i) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glow-card hover-lift p-6 cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                  <div className="mt-4 text-xs font-medium text-primary">
                    Coming Soon →
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
