import { Typography, Card, CardBody } from "@material-tailwind/react";

const TermsAndConditions = () => {
  return (
    <div className="mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <Typography variant="h2" className="text-center text-blue-600 font-semibold mb-6">
        Terms and Conditions
      </Typography>

      {sections.map((section, index) => (
        <Card key={index} className="mb-4">
          <CardBody>
            <Typography variant="h5" className="text-blue-500 font-medium mb-2">
              {section.title}
            </Typography>
            <Typography className="text-gray-700">{section.content}</Typography>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

const sections = [
  {
    title: "1. Introduction",
    content:
      "Welcome to Aussie Deals Hub. By using our website, you agree to comply with and be bound by the following terms and conditions. Please review these terms carefully.",
  },
  {
    title: "2. Use of the Website",
    content:
      "You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.",
  },
  {
    title: "3. Intellectual Property",
    content:
      "All content included on this site, such as text, graphics, logos, and software, is the property of Aussie Deals Hub or its content suppliers and is protected by international copyright laws.",
  },
  {
    title: "4. Product and Service Descriptions",
    content:
      "We strive to ensure that the information on our website is accurate and up-to-date. However, we do not warrant that product descriptions or other content on this site are accurate, complete, reliable, current, or error-free. All product prices and availability are subject to change without notice.",
  },
  {
    title: "5. Pricing",
    content:
      "All prices displayed on our website are sourced from third-party websites and are for reference purposes only. Prices are subject to change without notice. While we strive to ensure the accuracy of pricing information, errors may occur. We do not process payments or handle transactions, and we are not responsible for any discrepancies in pricing or product information. Please refer to the respective third-party websites for the most accurate and up-to-date information.",
  },
  {
    title: "6. Third-Party Links",
    content:
      "Our website may contain links to third-party websites that are not owned or controlled by Aussie Deals Hub. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. You acknowledge and agree that Aussie Deals Hub shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods, or services available on or through any such websites or services.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      "To the fullest extent permitted by applicable law, Aussie Deals Hub shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our website or the information displayed on it.",
  },
  {
    title: "8. Changes to Terms and Conditions",
    content:
      "Aussie Deals Hub reserves the right to change these terms and conditions at any time without prior notice. Any changes will be posted on this page, and it is your responsibility to review these terms regularly to ensure you are aware of any changes.",
  },
  {
    title: "9. Contact Information",
    content:
      "If you have any questions about these Terms and Conditions, please contact us at \n      contact@beneficiumvilis.com.",
  },
];

export default TermsAndConditions;
