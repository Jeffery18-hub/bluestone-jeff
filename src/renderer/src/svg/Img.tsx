import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="icon"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    {...props}
  >
    <path d="M797.2 892h-565c-55 0-100-45-100-100V228.667c0-55 45-100 100-100h563.333c55 0 100 45 100 100V792C897.2 847 852.2 892 797.2 892zm-565-730c-36.667 0-66.667 30-66.667 66.667V792c0 36.666 30 66.667 66.667 66.667h563.333c36.667 0 66.667-30 66.667-66.667V228.667C862.2 192 832.2 162 795.533 162H232.2z" />
    <path d="M665.534 892c-5.001 0-8.334-1.667-11.667-5L360.534 602 167.2 795.333c-6.668 6.667-16.668 6.667-23.334 0s-6.667-16.667 0-23.333l205-205c6.667-6.666 16.666-6.666 23.333 0l306.667 296.666c6.666 6.668 6.666 16.667 0 23.334-3.333 3.333-8.333 5-13.333 5z" />
    <path d="M473.867 703.667c-3.334 0-8.334-1.667-11.667-5-6.667-6.667-6.667-16.667-1.667-23.334l230.001-246.666c3.333-3.333 6.666-5 11.666-5s8.334 1.667 11.666 5L885.534 592c6.667 6.666 6.667 16.667 0 23.333s-16.666 6.668-23.333 0L702.2 463.666l-215 235c-3.334 3.334-8.333 5.001-13.333 5.001zM318.867 432c-46.667 0-86.667-38.333-86.667-86.667 0-46.666 38.334-86.666 86.667-86.666s86.667 38.333 86.667 86.666c0 48.334-40.001 86.667-86.667 86.667zm0-140c-28.334 0-53.333 23.333-53.333 53.333s23.333 53.334 53.333 53.334 53.333-23.333 53.333-53.334S347.2 292 318.867 292z" />
  </svg>
)

export default SvgComponent
