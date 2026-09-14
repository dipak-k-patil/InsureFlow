import { motion } from "framer-motion";
import { Sparkles, Image, Presentation, Video } from "lucide-react";

const tools = [
  { title: "AI Post Generator", desc: "Generate engaging social media posts for insurance products using AI", icon: Sparkles, gradient: "from-primary/20 to-secondary/20" },
  { title: "Festival Banners", desc: "Create beautiful festival greeting templates with your branding", icon: Image, gradient: "from-warning/20 to-destructive/20" },
  { title: "PPT Generator", desc: "Auto-generate professional presentations for client meetings", icon: Presentation, gradient: "from-success/20 to-primary/20" },
  { title: "Video Scripts", desc: "AI-powered video scripts for insurance marketing campaigns", icon: Video, gradient: "from-secondary/20 to-info/20" },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Marketing Tools</h1>
        <p className="text-muted-foreground mt-1">Create stunning marketing content powered by AI</p>
      </div>

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
              Launch tool →
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
