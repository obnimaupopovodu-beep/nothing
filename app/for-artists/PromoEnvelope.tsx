'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from './promo.module.css'

const smooth = (t: number) => t * t * (3 - 2 * t)

export function PromoEnvelope() {
  const section = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  // The incoming slide follows the preceding section in normal document flow.
  const exitY = useTransform(
    scrollYProgress,
    [0.82, 1],
    ['0%', '-100%'],
    { ease: smooth },
  )
  const angle = useTransform(scrollYProgress, [0.05, 0.4], [0, 174], { ease: smooth })
  const flapLayer = useTransform(angle, a => a < 90 ? 4 : 1)
  const paperY = useTransform(scrollYProgress, [0.41, 0.69], ['0%', '-120%'], { ease: smooth })
  const bodyY = useTransform(scrollYProgress, [0.05, 0.4, 0.69], ['12%', '25%', '63%'], { ease: smooth })

  return (
    <section ref={section} className={styles.section} aria-labelledby="promo-heading">
      <div className={styles.stage}>
        <motion.div className={styles.slide} style={{ y: exitY }}>
          <motion.div className={styles.envelope} style={{ y: bodyY }}>
            <motion.div className={styles.flap} style={{ rotateX: angle, zIndex: flapLayer }} aria-hidden="true">
              <div className={styles.outer}><b>uwbelieve.</b></div>
              <div className={styles.inner} />
            </motion.div>
            <motion.div className={styles.paper} style={{ y: paperY }}>
              <h2 id="promo-heading">Promo support<span>on major platforms.</span></h2>
              <p>Let your music be heard by curators and industry professionals.</p>
            </motion.div>
            <div className={styles.pocket} aria-hidden="true" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
