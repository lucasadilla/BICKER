import React from 'react'
import Link from 'next/link'

export function Pagination({ children, className = '', style = {}, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={className}
      style={{ display: 'flex', justifyContent: 'center', ...style }}
      {...props}
    >
      {children}
    </nav>
  )
}

export function PaginationContent({ children, className = '', style = {}, ...props }) {
  return (
    <ul
      className={className}
      style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '4px', ...style }}
      {...props}
    >
      {children}
    </ul>
  )
}

export function PaginationItem({ children, className = '', style = {}, ...props }) {
  return (
    <li className={className} style={style} {...props}>
      {children}
    </li>
  )
}

export function PaginationLink({ href, isActive, disabled, children, className = '', style = {}, ...props }) {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    border: '1px solid #ccc',
    padding: '0 8px',
    height: '32px',
    textDecoration: 'none',
    color: '#000',
    backgroundColor: isActive ? '#e5e7eb' : '#fff',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  }

  return (
    <Link href={href} className={className} style={{ ...baseStyle, ...style }} {...props}>
      {children}
    </Link>
  )
}

export function PaginationPrevious({ href, disabled, ...props }) {
  return (
    <PaginationLink href={href} disabled={disabled} {...props}>
      Previous
    </PaginationLink>
  )
}

export function PaginationNext({ href, disabled, ...props }) {
  return (
    <PaginationLink href={href} disabled={disabled} {...props}>
      Next
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className = '', style = {}, ...props }) {
  return (
    <span
      className={className}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', ...style }}
      {...props}
    >
      ...
    </span>
  )
}

