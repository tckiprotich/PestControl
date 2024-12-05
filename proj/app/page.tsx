import { ImageUpload } from './components/image-upload'
import { Button } from "@/components/ui/button"
import { ArrowRight, Bug, Leaf, Shield } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Pest Detection System</h1>
          <p className="text-xl text-white opacity-80">Protect your crops with AI-powered pest identification</p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <ImageUpload />
          </div>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Why Use Our System?</h2>
              <ul className="space-y-2 text-white">
                <li className="flex items-center"><Bug className="mr-2 h-5 w-5" /> Early pest detection</li>
                <li className="flex items-center"><Leaf className="mr-2 h-5 w-5" /> Protect your crops</li>
                <li className="flex items-center"><Shield className="mr-2 h-5 w-5" /> Reduce pesticide use</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How It Works</h2>
              <ol className="space-y-2 text-white list-decimal list-inside">
                <li>Upload a clear image of the suspected pest</li>
                <li>Our AI analyzes the image in seconds</li>
                <li>Receive identification and treatment recommendations</li>
              </ol>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">When to Use</h2>
              <p className="text-white">Use our system whenever you spot unfamiliar insects or signs of pest damage in your crops. Regular checks can prevent infestations before they become severe.</p>
            </section>
            <Button asChild className="mt-4">
              <Link href="#learn-more">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>

      <section id="learn-more" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Empowering Farmers with Technology</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Precision Agriculture</h3>
              <p>Our AI-powered system brings the latest in precision agriculture to your fingertips, enabling targeted pest control strategies.</p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Eco-Friendly Farming</h3>
              <p>By accurately identifying pests, you can minimize pesticide use, promoting environmentally friendly farming practices.</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Cost-Effective Solution</h3>
              <p>Early detection and targeted treatment save both time and resources, increasing your farm's overall efficiency and profitability.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Pest Detection System. All rights reserved.</p>
          <p className="mt-2">Protecting crops, empowering farmers.</p>
        </div>
      </footer>
    </div>
  )
}

