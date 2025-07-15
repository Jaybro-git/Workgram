import React from 'react'

const ContactUs = () => {
  return (
    <section className="py-20 px-6 bg-white border-t border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-700 mb-6">
              Have feedback or need help? Just drop us a message — we're here to assist you.
            </p>
            <form className="flex flex-col gap-4 text-left">
              <textarea
                rows={2}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>

              <div className="flex items-center justify-between -mt-3">
                <p className="text-sm text-gray-500 -mt-5">We usually reply within 24 hours.</p>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition mt-2"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </section>
  );
};

export default ContactUs;
        