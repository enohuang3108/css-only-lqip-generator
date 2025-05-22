interface CssImplementationProps {
  lqip: number;
}

export const CssImplementation = ({ lqip }: CssImplementationProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">HTML</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
          {`<img src="image.jpg" style="--lqip:${lqip}"/>`}
        </pre>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2">CSS</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
          {`
[style*="--lqip:"] {
  --lqip-ca: mod(round(down, calc((var(--lqip) + 524288) / 262144)), 4);
  --lqip-cb: mod(round(down, calc((var(--lqip) + 524288) / 65536)), 4);
  --lqip-cc: mod(round(down, calc((var(--lqip) + 524288) / 16384)), 4);
  --lqip-cd: mod(round(down, calc((var(--lqip) + 524288) / 4096)), 4);
  --lqip-ce: mod(round(down, calc((var(--lqip) + 524288) / 1024)), 4);
  --lqip-cf: mod(round(down, calc((var(--lqip) + 524288) / 256)), 4);
  --lqip-ll: mod(round(down, calc((var(--lqip) + 524288) / 64)), 4);
  --lqip-aaa: mod(round(down, calc((var(--lqip) + 524288) / 8)), 8);
  --lqip-bbb: mod(calc(var(--lqip) + 524288), 8);

  --lqip-ca-clr: hsl(0 0% calc(var(--lqip-ca) / 3 * 100%));
  --lqip-cb-clr: hsl(0 0% calc(var(--lqip-cb) / 3 * 100%));
  --lqip-cc-clr: hsl(0 0% calc(var(--lqip-cc) / 3 * 100%));
  --lqip-cd-clr: hsl(0 0% calc(var(--lqip-cd) / 3 * 100%));
  --lqip-ce-clr: hsl(0 0% calc(var(--lqip-ce) / 3 * 100%));
  --lqip-cf-clr: hsl(0 0% calc(var(--lqip-cf) / 3 * 100%));
  --lqip-base-clr: oklab(
    calc(var(--lqip-ll) / 3 * 0.6 + 0.2) calc(var(--lqip-aaa) / 8 * 0.7 - 0.35)
      calc((var(--lqip-bbb) + 1) / 8 * 0.7 - 0.35)
  );

  --lqip-stop10: 2%;
  --lqip-stop20: 8%;
  --lqip-stop30: 18%;
  --lqip-stop40: 32%;
  background-blend-mode: hard-light, hard-light, hard-light, hard-light,
    hard-light, hard-light, overlay, overlay, overlay, overlay, overlay, overlay,
    normal;
  background-image: radial-gradient(
      50% 75% at 16.67% 25%,
      rgb(from var(--lqip-ca-clr) r g b / 50%),
      rgb(from var(--lqip-ca-clr) r g b / calc(50% - var(--lqip-stop10) / 2))
        10%,
      rgb(from var(--lqip-ca-clr) r g b / calc(50% - var(--lqip-stop20) / 2))
        20%,
      rgb(from var(--lqip-ca-clr) r g b / calc(50% - var(--lqip-stop30) / 2))
        30%,
      rgb(from var(--lqip-ca-clr) r g b / calc(50% - var(--lqip-stop40) / 2))
        40%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop40) / 2)) 60%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop30) / 2)) 70%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop20) / 2)) 80%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop10) / 2)) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 83.33% 25%,
      rgb(from var(--lqip-cc-clr) r g b / 50%),
      rgb(from var(--lqip-cc-clr) r g b / calc(50% - var(--lqip-stop10) / 2))
        10%,
      rgb(from var(--lqip-cc-clr) r g b / calc(50% - var(--lqip-stop20) / 2))
        20%,
      rgb(from var(--lqip-cc-clr) r g b / calc(50% - var(--lqip-stop30) / 2))
        30%,
      rgb(from var(--lqip-cc-clr) r g b / calc(50% - var(--lqip-stop40) / 2))
        40%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop40) / 2)) 60%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop30) / 2)) 70%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop20) / 2)) 80%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop10) / 2)) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 50% 25%,
      rgb(from var(--lqip-cb-clr) r g b / 50%),
      rgb(from var(--lqip-cb-clr) r g b / calc(50% - var(--lqip-stop10) / 2))
        10%,
      rgb(from var(--lqip-cb-clr) r g b / calc(50% - var(--lqip-stop20) / 2))
        20%,
      rgb(from var(--lqip-cb-clr) r g b / calc(50% - var(--lqip-stop30) / 2))
        30%,
      rgb(from var(--lqip-cb-clr) r g b / calc(50% - var(--lqip-stop40) / 2))
        40%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop40) / 2)) 60%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop30) / 2)) 70%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop20) / 2)) 80%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop10) / 2)) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 16.67% 75%,
      rgb(from var(--lqip-cd-clr) r g b / 50%),
      rgb(from var(--lqip-cd-clr) r g b / calc(50% - var(--lqip-stop10) / 2))
        10%,
      rgb(from var(--lqip-cd-clr) r g b / calc(50% - var(--lqip-stop20) / 2))
        20%,
      rgb(from var(--lqip-cd-clr) r g b / calc(50% - var(--lqip-stop30) / 2))
        30%,
      rgb(from var(--lqip-cd-clr) r g b / calc(50% - var(--lqip-stop40) / 2))
        40%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop40) / 2)) 60%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop30) / 2)) 70%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop20) / 2)) 80%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop10) / 2)) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 83.33% 75%,
      rgb(from var(--lqip-cf-clr) r g b / 50%),
      rgb(from var(--lqip-cf-clr) r g b / calc(50% - var(--lqip-stop10) / 2))
        10%,
      rgb(from var(--lqip-cf-clr) r g b / calc(50% - var(--lqip-stop20) / 2))
        20%,
      rgb(from var(--lqip-cf-clr) r g b / calc(50% - var(--lqip-stop30) / 2))
        30%,
      rgb(from var(--lqip-cf-clr) r g b / calc(50% - var(--lqip-stop40) / 2))
        40%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop40) / 2)) 60%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop30) / 2)) 70%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop20) / 2)) 80%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop10) / 2)) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 50% 75%,
      rgb(from var(--lqip-ce-clr) r g b / 50%),
      rgb(from var(--lqip-ce-clr) r g b / calc(50% - var(--lqip-stop10) / 2))
        10%,
      rgb(from var(--lqip-ce-clr) r g b / calc(50% - var(--lqip-stop20) / 2))
        20%,
      rgb(from var(--lqip-ce-clr) r g b / calc(50% - var(--lqip-stop30) / 2))
        30%,
      rgb(from var(--lqip-ce-clr) r g b / calc(50% - var(--lqip-stop40) / 2))
        40%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop40) / 2)) 60%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop30) / 2)) 70%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop20) / 2)) 80%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop10) / 2)) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 16.67% 25%,
      var(--lqip-ca-clr),
      rgb(from var(--lqip-ca-clr) r g b / calc(100% - var(--lqip-stop10))) 10%,
      rgb(from var(--lqip-ca-clr) r g b / calc(100% - var(--lqip-stop20))) 20%,
      rgb(from var(--lqip-ca-clr) r g b / calc(100% - var(--lqip-stop30))) 30%,
      rgb(from var(--lqip-ca-clr) r g b / calc(100% - var(--lqip-stop40))) 40%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop40))) 60%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop30))) 70%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop20))) 80%,
      rgb(from var(--lqip-ca-clr) r g b / calc(var(--lqip-stop10))) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 50% 25%,
      var(--lqip-cb-clr),
      rgb(from var(--lqip-cb-clr) r g b / calc(100% - var(--lqip-stop10))) 10%,
      rgb(from var(--lqip-cb-clr) r g b / calc(100% - var(--lqip-stop20))) 20%,
      rgb(from var(--lqip-cb-clr) r g b / calc(100% - var(--lqip-stop30))) 30%,
      rgb(from var(--lqip-cb-clr) r g b / calc(100% - var(--lqip-stop40))) 40%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop40))) 60%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop30))) 70%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop20))) 80%,
      rgb(from var(--lqip-cb-clr) r g b / calc(var(--lqip-stop10))) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 83.33% 25%,
      var(--lqip-cc-clr),
      rgb(from var(--lqip-cc-clr) r g b / calc(100% - var(--lqip-stop10))) 10%,
      rgb(from var(--lqip-cc-clr) r g b / calc(100% - var(--lqip-stop20))) 20%,
      rgb(from var(--lqip-cc-clr) r g b / calc(100% - var(--lqip-stop30))) 30%,
      rgb(from var(--lqip-cc-clr) r g b / calc(100% - var(--lqip-stop40))) 40%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop40))) 60%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop30))) 70%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop20))) 80%,
      rgb(from var(--lqip-cc-clr) r g b / calc(var(--lqip-stop10))) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 16.67% 75%,
      var(--lqip-cd-clr),
      rgb(from var(--lqip-cd-clr) r g b / calc(100% - var(--lqip-stop10))) 10%,
      rgb(from var(--lqip-cd-clr) r g b / calc(100% - var(--lqip-stop20))) 20%,
      rgb(from var(--lqip-cd-clr) r g b / calc(100% - var(--lqip-stop30))) 30%,
      rgb(from var(--lqip-cd-clr) r g b / calc(100% - var(--lqip-stop40))) 40%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop40))) 60%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop30))) 70%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop20))) 80%,
      rgb(from var(--lqip-cd-clr) r g b / calc(var(--lqip-stop10))) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 50% 75%,
      var(--lqip-ce-clr),
      rgb(from var(--lqip-ce-clr) r g b / calc(100% - var(--lqip-stop10))) 10%,
      rgb(from var(--lqip-ce-clr) r g b / calc(100% - var(--lqip-stop20))) 20%,
      rgb(from var(--lqip-ce-clr) r g b / calc(100% - var(--lqip-stop30))) 30%,
      rgb(from var(--lqip-ce-clr) r g b / calc(100% - var(--lqip-stop40))) 40%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop40))) 60%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop30))) 70%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop20))) 80%,
      rgb(from var(--lqip-ce-clr) r g b / calc(var(--lqip-stop10))) 90%,
      transparent
    ),
    radial-gradient(
      50% 75% at 83.33% 75%,
      var(--lqip-cf-clr),
      rgb(from var(--lqip-cf-clr) r g b / calc(100% - var(--lqip-stop10))) 10%,
      rgb(from var(--lqip-cf-clr) r g b / calc(100% - var(--lqip-stop20))) 20%,
      rgb(from var(--lqip-cf-clr) r g b / calc(100% - var(--lqip-stop30))) 30%,
      rgb(from var(--lqip-cf-clr) r g b / calc(100% - var(--lqip-stop40))) 40%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop40))) 60%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop30))) 70%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop20))) 80%,
      rgb(from var(--lqip-cf-clr) r g b / calc(var(--lqip-stop10))) 90%,
      transparent
    ),
    linear-gradient(0deg, var(--lqip-base-clr), var(--lqip-base-clr));
}
`}
        </pre>
      </div>
    </div>
  );
};
