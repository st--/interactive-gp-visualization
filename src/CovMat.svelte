<!-- Copyright (c) 2021 ST John -->
<script>
  import Katex from "./Katex.svelte";
  export let atX1, atX2;

  let numDigits = 3;
  const unicodeMinusSign = "\u2212";
  const unicodeFigureSpace = "\u2007";

  function format(val, addSpace = true) {
    const str = `${val.toFixed(numDigits)}`;
    if (val < 0) {
      return str.replace("-", unicodeMinusSign);
    } else {
      if (addSpace) {
        return str; // unicodeFigureSpace + unicodeFigureSpace + str;
      } else {
        return str;
      }
    }
  }

  $: correlation = atX1.k2 / Math.sqrt(atX1.k1 * atX2.k2);

  $: rho = format(correlation, false);
  $: k11 = format(atX1.k1);
  $: k12 = format(atX1.k2);
  $: k21 = format(atX2.k1);
  $: k22 = format(atX2.k2);

  const covarianceSymbolStr = "\\operatorname{cov}(f(x_1), f(x_2)) = ";
  const correlationSymbolStr = "\\rho(f(x_1), f(x_2)) =";
</script>

<div style="margin-left: 2em; display: flex; align-items: center; height: 90%;">
  <div style="">
    <div>
      <Katex math={covarianceSymbolStr} />
      <nobr
        ><span class="bracket">(</span>
        <table>
          <tr
            ><td><span id="k11">{k11}</span></td><td
              ><span id="k12">{k12}</span></td
            ></tr
          >
          <tr
            ><td><span id="k21">{k21}</span></td><td
              ><span id="k22">{k22}</span></td
            ></tr
          >
        </table>
        <span class="bracket">)</span></nobr
      >
    </div>
    <div>
      correlation <Katex math={correlationSymbolStr} /> <span>{rho}</span>
    </div>
  </div>
</div>

<style>
  span {
    font-family: "Latin Modern Math";
    font-size: 20px;
  }
  .bracket {
    font-family: "Latin Modern Math";
    transform: scale(2, 3);
    font-size: 1em;
    display: inline-block;
    vertical-align: middle;
  }
  #k11 {
    border: 1px solid red;
    border-radius: 5px;
  }
  #k12 {
    border: 1px dashed;
    border-color: red orange;
    border-radius: 5px;
  }
  #k21 {
    border: 1px dashed;
    border-color: orange red;
    border-radius: 5px;
  }
  #k22 {
    border: 1px solid orange;
    border-radius: 5px;
  }

  td {
    text-align: right;
  }
  td:first-child span {
    margin-left: 0ex !important;
  }
  td:last-child span {
    margin-right: 0ex !important;
  }
  table {
    display: inline-block;
    vertical-align: middle;
  }
</style>
