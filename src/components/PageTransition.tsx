'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Transition } from '@headlessui/react'

interface Props {
  children: React.ReactNode
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname()
  const [currentChild, setCurrentChild] = useState(children)
  const [show, setShow] = useState(true)

  useEffect(() => {
    setShow(false) // start fade out
    const timeout = setTimeout(() => {
      setCurrentChild(children) // swap content
      setShow(true) // fade in new content
    }, 50) // short timeout
    return () => clearTimeout(timeout)
  }, [pathname, children])

  return (
    <Transition
      show={show}
      appear
      enter="transition-opacity duration-200 ease-out"
      enterFrom="opacity-90"
      enterTo="opacity-100"
      leave="transition-opacity duration-200 ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-90"
    >
      <div className="relative w-full flex flex-row justify-center">{currentChild}</div>
    </Transition>
  )
}
