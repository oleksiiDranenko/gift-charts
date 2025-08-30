'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'

interface Props {
  children: React.ReactNode
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname()
  const [show, setShow] = useState(true)
  const [currentChild, setCurrentChild] = useState(children)

  useEffect(() => {
    setShow(false) // start exit
    const timeout = setTimeout(() => {
      setCurrentChild(children) // swap content
      setShow(true) // trigger enter animation
    }, 200) // duration matches transition
    return () => clearTimeout(timeout)
  }, [pathname, children])

  return (
    <Transition
      appear
      show={show}
      enter="transition-transform transition-opacity duration-200 ease-out"
      enterFrom="opacity-0 translate-y-6"
      enterTo="opacity-100 translate-y-0"
      leave="transition-none" // keep old page until new one enters
    >
      <div className="relative w-full">{currentChild}</div>
    </Transition>
  )
}
