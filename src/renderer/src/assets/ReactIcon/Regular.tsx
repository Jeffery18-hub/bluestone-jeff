import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="1em"
    viewBox="0 96 960 960"
    width="1em"
    fill={'currentColor'}
    {...props}
  >
    <path d="M197 857q-54-58-85.5-130.5T80 575q0-80 30.5-152.5T197 293l43 42q-48 48-74 110t-26 130q0 67 27 128t73 111l-43 43Zm183-51q-21 0-35.5-14.5T330 756q0-21 14.5-35.5T380 706q21 0 35.5 14.5T430 756q0 21-14.5 35.5T380 806Zm149-200v-79l-67 40-30-52 67-39-67-39 30-52 67 40v-79h60v79l67-40 30 52-67 39 67 39-30 52-67-40v79h-60Zm234 251-43-43q47-48 73.5-109.5T820 575q0-68-26.5-129.5T720 335l43-42q54 58 85.5 130.5T880 575q0 80-30.5 152.5T763 857Z" />
  </svg>
)

export default SvgComponent
