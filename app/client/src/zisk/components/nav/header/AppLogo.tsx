import { Box, Stack } from '@mui/material'
import { Link } from '@tanstack/react-router'

export default function AppLogo() {
  return (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Stack direction="row" gap={1} alignItems="center" sx={(theme) => ({ color: theme.palette.primary.main })}>
        <svg
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 131.1 121.01"
          style={{ height: '28px', width: 'auto' }}>
          <g id="Layer_1-2" data-name="Layer_1">
            <g>
              <path d="M128.71,67.39l-22.47-25.78h-.01l-.39-.44-3.17-3.64-.32-.38L72.87,3.33c-1.93-2.22-4.62-3.33-7.32-3.33s-5.39,1.11-7.33,3.33l-29.48,33.82-.32.38-3.17,3.64-.39.44h.01L2.4,67.39c-3.78,4.32-2.99,10.96,1.68,14.29l50.11,35.69c6.8,4.85,15.93,4.85,22.73,0l50.1-35.69c4.68-3.33,5.46-9.97,1.69-14.29ZM62.05,66.75c0-1.18,1.56-3.29,3.49-3.51,1.94-.2,3.51.82,3.51,3.5,0,1.18-1.56,3.3-3.5,3.5-1.93.21-3.5-.81-3.5-3.49ZM65.56,74.29c1.93.2,3.5,2.36,3.5,3.49,0,2.72-1.56,3.73-3.49,3.51-1.93-.22-3.5-2.37-3.5-3.5,0-2.72,1.56-3.72,3.49-3.5ZM65.58,85.33c1.93-.3,3.5.46,3.5,3.49,0,.86-1.56,3.19-3.49,3.51,0,0,0,0,0,0-1.93.29-3.49-.45-3.5-3.5,0-.83,1.56-3.2,3.5-3.5ZM65.59,96.37c1.94-.14,3.51,1.04,3.51,3.49,0,1.42-1.56,3.37-3.49,3.51,0,0,0,0,0,0-1.93.14-3.5-1.04-3.5-3.49,0-1.42,1.56-3.37,3.49-3.51ZM68.09,112.94c-.65.83-1.55,1.55-2.47,1.47-.23,0-.46-.02-.69-.05-.22-.02-.44-.06-.65-.09-.21-.03-.42-.07-.61-.14-.19-.07-.37-.15-.53-.28-.65-.47-1.02-2.01-1.02-2.93,0-.92.37-1.19,1.02-2.02.16-.19.34-.4.53-.59.19-.18.4-.36.61-.5.21-.14.43-.24.65-.31,1.14-.16,2.35-.02,3.16.48.65.47,1.03,2,1.03,2.93,0,.91-.38,1.19-1.03,2.03ZM71.76,58.79c-1.82,1.3-3.97,1.99-6.21,1.99s-4.4-.69-6.23-2l-25.59-18.22L62.74,7.28c.97-1.12,2.18-1.28,2.81-1.28s1.84.16,2.8,1.27l29.02,33.29-25.61,18.23Z" />
              <g>
                <path d="M62.03,55.71c0-2.54,1.56-3.67,3.5-3.51t0,0c1.93.16,3.5,2.16,3.5,3.5h0c0,2.52-1.56,3.67-3.49,3.5t0,0c-1.94-.16-3.5-2.17-3.51-3.49Z" />
                <path d="M62.01,44.67c0-2.83,1.57-3.75,3.5-3.51t0,0c1.93.24,3.5,2.44,3.5,3.49t0,0c0,2.81-1.56,3.76-3.49,3.51h0s0,0,0,0t0,0c-1.93-.23-3.49-2.45-3.5-3.49Z" />
                <path d="M62,33.63c0-3.06,1.56-3.83,3.49-3.51t0,0c1.93.29,3.5,2.71,3.51,3.49t0,0c0,3.07-1.56,3.82-3.5,3.51t0,0c-1.93-.3-3.5-2.69-3.5-3.49Z" />
                <path d="M61.98,22.58c0-1.48,1.56-3.38,3.5-3.5t0,0c1.93-.12,3.5,1.11,3.5,3.49t0,0c0,1.48-1.56,3.37-3.49,3.51t0,0c-1.94.12-3.51-1.11-3.51-3.5Z" />
                <path d="M65.46,15.04c-.92-.06-1.82-.17-2.47-.69-.65-.51-1.03-1.89-1.03-2.81,0-.23.03-.43.07-.62.05-.17.11-.34.2-.5.09-.16.2-.32.32-.5.13-.17.28-.35.44-.54,1.3-1.79,3.64-1.47,4.95-.66.65.51,1.02,1.89,1.02,2.81,0,.92-.37,1.34-1.02,2.13-.65.78-1.56,1.44-2.48,1.37Z" />
              </g>
            </g>
          </g>
        </svg>
        <Box style={{ height: '18px', width: 'auto' }} sx={(theme) => ({ color: theme.palette.text.primary })}>
          <svg
            fill="currentColor"
            style={{ height: '18px', width: 'auto' }}
            xmlns="http://www.w3.org/2000/svg"
            width="357.3"
            height="120.45"
            viewBox="0 0 357.3 120.45">
            <defs></defs>
            <g id="Layer_1-2">
              <path
                className="cls-1"
                d="M0,118.35v-15.15L83.1,15.75l12.75,6.6H.6V5.85h103.05v15L20.4,108.6l-10.95-6.75h94.65v16.5H0Z"
              />
              <path
                className="cls-1"
                d="M130.35,22.2c-3.7,0-6.75-1.02-9.15-3.08-2.4-2.05-3.6-4.72-3.6-8.02s1.2-5.97,3.6-8.03c2.4-2.05,5.45-3.08,9.15-3.08s6.88,1.03,9.23,3.08c2.35,2.05,3.52,4.73,3.52,8.03s-1.18,5.98-3.52,8.02c-2.35,2.05-5.43,3.08-9.23,3.08ZM120.6,32.85l9.75,1.8,9.75-1.8v85.5h-19.5V32.85Z"
              />
              <path
                className="cls-1"
                d="M248.7,92.55c0,5.7-1.6,10.65-4.8,14.85-3.2,4.2-8.05,7.42-14.55,9.67-6.5,2.25-14.65,3.38-24.45,3.38s-18.85-1.27-26.25-3.82c-7.4-2.55-13.12-6.15-17.17-10.8-4.05-4.65-6.23-10.02-6.53-16.12h19.8c.6,3.2,2.22,6.03,4.88,8.48,2.65,2.45,6.15,4.33,10.5,5.62,4.35,1.3,9.32,1.95,14.92,1.95,8.1,0,14.2-.98,18.3-2.93,4.1-1.95,6.15-4.92,6.15-8.92,0-2.7-1.38-4.75-4.12-6.15-2.75-1.4-7.93-2.45-15.52-3.15l-16.65-1.5c-9-.8-16.1-2.42-21.3-4.88-5.2-2.45-8.9-5.45-11.1-9-2.2-3.55-3.3-7.32-3.3-11.33,0-5.8,1.8-10.65,5.4-14.55,3.6-3.9,8.6-6.87,15-8.92,6.4-2.05,13.85-3.08,22.35-3.08s16.65,1.23,23.55,3.67c6.9,2.45,12.4,5.85,16.5,10.2,4.1,4.35,6.4,9.38,6.9,15.08h-19.8c-.4-2.3-1.58-4.52-3.53-6.68-1.95-2.15-4.9-3.95-8.85-5.4-3.95-1.45-9.23-2.17-15.83-2.17-7,0-12.48.9-16.42,2.7-3.95,1.8-5.92,4.45-5.92,7.95,0,2.2,1.2,4.08,3.6,5.62,2.4,1.55,6.85,2.62,13.35,3.23l21.45,1.95c8.6.8,15.32,2.33,20.17,4.58,4.85,2.25,8.27,5.13,10.28,8.62,2,3.5,3,7.45,3,11.85Z"
              />
              <path
                className="cls-1"
                d="M283.95,101.4l-5.7-2.1,54-65.85h22.5l-72.15,84.9h-18.15V2.85h19.5v98.55ZM308.1,76.35l13.65-12.3,35.55,54.3h-22.95l-26.25-42Z"
              />
            </g>
          </svg>
        </Box>
      </Stack>
    </Link>
  )
}
