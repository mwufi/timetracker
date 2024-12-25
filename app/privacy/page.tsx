import { type Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Exxa",
  description: "Privacy policy for Exxa app",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">Last updated July 30, 2024</p>

      <div className="space-y-6">
        <p>
          This privacy notice for Exxa ("we," "us," or "our"), describes how and why we might collect, store, use, and/or share ("process") your information when you use our services ("Services"), such as when you:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Visit our website, or any website of ours that links to this privacy notice</li>
          <li>Engage with us in other related ways, including any sales, marketing, or events</li>
        </ul>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="font-medium">Questions or concerns?</p>
          <p>Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at team@exxa.com.</p>
        </div>

        <section>
          <h2 className="text-2xl font-bold mt-8 mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
          <p className="font-medium italic">In Short: We collect personal information that you provide to us.</p>
          
          <p className="mt-4">
            We collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>

          <p className="mt-4 font-medium">Personal Information Provided by You.</p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </p>

          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>billing addresses</li>
            <li>email addresses</li>
            <li>phone numbers</li>
            <li>names</li>
          </ul>

          <div className="mt-6">
            <p className="font-medium">Sensitive Information.</p>
            <p>
              We do not process sensitive information. All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
