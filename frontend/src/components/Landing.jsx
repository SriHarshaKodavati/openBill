import React from 'react'
import { motion } from 'framer-motion'
import { Users, Calculator, Share2, Sparkles } from 'lucide-react'

const Landing = ({ onJoinGroup }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            OpenBill
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Split bills effortlessly with friends. Create groups, track expenses, 
            and settle up with beautiful simplicity.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: Users, title: "Team Up", desc: "Join groups with unique codes" },
            { icon: Calculator, title: "Track Easy", desc: "Add expenses in seconds" },
            { icon: Share2, title: "Split Fair", desc: "See who owes what, instantly" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <feature.icon className="w-8 h-8 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onJoinGroup}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <Sparkles className="w-5 h-5" />
          Get Started
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Landing
