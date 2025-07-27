import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <Container>
      <div className="py-14 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter">
            Sereniv Skin Science
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nature Meets Proven Formulation
          </p>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="prose prose-lg mx-auto">
            <p className="text-lg leading-relaxed text-gray-700">
              In the vibrant city of Aligarh, known for its intellectual spirit and deep-rooted culture, 
              two sisters, Ameena and Iqra Syed, were on a promising path in the field of law. Talented, 
              articulate, and determined, they were climbing the ranks in legal practice, driven by a shared 
              passion for justice and advocacy. But life, in its unexpected way, led them down a completely 
              different road—one that turned their world upside down and birthed a new mission called 
              <strong> Sereniv Skin Science</strong>, a herbal skincare brand born out of ambition and purpose.
            </p>

            <div className="my-12 p-8 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">The Sisters' Journey</h2>
              <p className="text-gray-700">
                Ameena Syed, the elder one and founder of Sereniv was already a PhD scholar of Law. 
                Iqra Syed, the Co-Founder still in law school at the time, was just as committed—sharp-minded, 
                and driven by the idea of helping people through legal empowerment.
              </p>
              <p className="text-gray-700 mt-4">
                Their childhood was marked by curiosity and learning, especially for Ameena, who had always 
                been fascinated by herbs. From an early age, she was drawn to understanding natural ingredients 
                and spent hours exploring their benefits. While both sisters eventually pursued careers in law, 
                Ameena's passion for herbal knowledge remained strong—quietly present in the background, 
                waiting for its moment. The world of neem leaves and plant-based healing never truly left her mind.
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">The Turning Point</h2>
            <p className="text-lg leading-relaxed text-gray-700">
              It was in early 2020 that their close friend, began using a trending chemical-based skin treatment 
              that was gaining popularity on social media. She had always struggled with adult acne and pigmentation. 
              Drawn by flashy advertisements and influencer testimonials, she tried a high-potency chemical exfoliating serum. 
              At first, it seemed like a miracle—her scars began fading.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mt-4">
              But within weeks, she started noticing burning, unusual discoloration, and swelling on her face. 
              Thinking it was a temporary reaction, she continued use. By the time she sought medical attention, 
              it was too late. A biopsy confirmed the unimaginable—she had developed cutaneous T-cell lymphoma, 
              a rare and aggressive form of skin cancer triggered by chemical exposure.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mt-4">
              The shock was devastating. Despite chemotherapy and hospital care, she passed away within a year.
            </p>

            <div className="my-12 p-8 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <h3 className="text-xl font-semibold mb-4 text-orange-800">The Mission Begins</h3>
              <p className="text-gray-700">
                For the next five years, Ameena and Iqra devoted themselves entirely to researching herbal ingredients, 
                cosmetic toxicology, and safe formulation techniques. They attended workshops, consulted with botanists 
                and dermatologists, and tested countless prototypes on themselves and volunteers. What began as a response 
                to personal loss slowly evolved into a mission backed by science, dedication, and countless sleepless nights.
              </p>
              <p className="text-gray-700 mt-4">
                Finally, in 2025, their years of hard work came to life with the official launch of their herbal 
                skincare brand—<strong>Sereniv Skin Science</strong>—a name that stood for serenity, nature, and truth in beauty.
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-12 mb-6">Scientific Reasoning Behind Sereniv</h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Despite not having scientific degrees, the sisters immersed themselves in cosmetic dermatology and plant biology. 
              Ameena enrolled in an online diploma course on herbal cosmetic formulation. They reached out to professors at 
              AMU (Aligarh Muslim University) for access to their botany labs. They learned about the skin's acid mantle, 
              pH sensitivity, and how parabens, phthalates, and synthetic preservatives can slowly deteriorate skin cells 
              and disrupt endocrine balance.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mt-4">
              They found that many mainstream brands used compounds such as formaldehyde releasers and BHT, which, 
              when combined with sunlight or absorbed over time, could potentially become carcinogenic. This wasn't 
              speculation—it was science backed by peer-reviewed journals and international medical advisories.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mt-4">
              Using this knowledge, they began researching herbal alternatives that aligned with the body's natural 
              healing process. Their first prototype—a calming aloe papaya gel was created not in a lab but in their kitchen. 
              It contained no fragrance, no color, just pure healing.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-6">The Birth of Sereniv Skin Science</h2>
            <p className="text-lg leading-relaxed text-gray-700">
              The brand name Sereniv was born from "Serene" and "Viva"—symbolizing peace and life. The brand launched 
              officially in mid-2025 from Aligarh.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mt-4">
              They focused on small batch production, local ingredient sourcing, and zero synthetics. They used indian 
              and foreign herbs. Every formula was tested on real people, not in sterile labs, and every result was documented. 
              Their law training helped them build a strong regulatory framework and ensure their products complied with 
              every legal and health standard.
            </p>

            <h2 className="text-2xl font-semibold mt-12 mb-6">Obstacles and Breakthroughs</h2>
            <p className="text-lg leading-relaxed text-gray-700">
              As they scaled, challenges came thick and fast. Banks didn't understand the vision. Investors dismissed 
              "herbal" as just another trend. Manufacturers demanded large MOQs (minimum order quantities). Some laughed 
              at the idea of "lawyers becoming skincare experts."
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mt-4">
              But slowly, their authenticity caught on. Customers who had suffered from chemical burns or eczema found 
              relief in Sereniv.
            </p>

            <div className="my-12 p-8 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h3 className="text-xl font-semibold mb-4 text-green-800">Legacy, Love, and a Future Ahead</h3>
              <p className="text-gray-700">
                Today, Sereniv Skin Science isn't just a brand—it's a movement. A movement that demands safer products, 
                transparent formulations, and consumer education. Ameena now leads R&D, manufacturing and regulatory affairs. 
                Iqra heads community outreach, marketing, R&D, and sustainability.
              </p>
              <p className="text-gray-700 mt-4 font-semibold">
                What began as a personal journey has evolved into a powerful national message:
              </p>
              <p className="text-gray-700 mt-2 italic">
                Your skin is an organ. It deserves respect and care, not poison.
              </p>
              <p className="text-gray-700 mt-4">
                Guided by the integrity of science and a deep respect for nature, Sereniv Skin Science continues 
                its mission—to heal, protect, and honor every life it touches.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Experience the Sereniv Difference</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully formulated products that honor your skin's natural beauty and health.
          </p>
          <Link href="/shop/all">
            <Button size="lg" className="bg-gray-900 text-white hover:bg-black rounded-full px-8 py-3 mt-6 text-base">
              Shop Our Products
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
} 