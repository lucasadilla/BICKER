import React from 'react'
import Link from 'next/link'

export function Pagination({ children, className = '', style = {}, ...props }) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={`pagination ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </nav>
  )
}

export function PaginationContent({ children, className = '', style = {}, ...props }) {
  return (
    <ul
      className={`pagination-content ${className}`.trim()}
      style={style}
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
  const classes = [
    'pagination-link',
    isActive && 'active',
    disabled && 'disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    <Link href={href} aria-disabled={disabled} className={classes} style={style} {...props}>
      {children}
    </Link>
  )
}

export function PaginationPrevious({ href, disabled, className = '', ...props }) {
  return (
    <PaginationLink
      href={href}
      disabled={disabled}
      className={`pagination-previous ${className}`.trim()}
      {...props}
    >
      <span aria-hidden="true" style={{ marginRight: '4px' }}>
        &#8249;
      </span>
      <span>Previous</span>
    </PaginationLink>
  )
}

export function PaginationNext({ href, disabled, className = '', ...props }) {
  return (
    <PaginationLink
      href={href}
      disabled={disabled}
      className={`pagination-next ${className}`.trim()}
      {...props}
    >
      <span>Next</span>
      <span aria-hidden="true" style={{ marginLeft: '4px' }}>
        &#8250;
      </span>
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className = '', style = {}, ...props }) {
  return (
    <span
      className={`pagination-ellipsis ${className}`.trim()}
      style={style}
      {...props}
    >
      &#8230;
    </span>
  )
}

