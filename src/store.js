export let size;
export let best_matches = [];

export function textTolist(text){
    let lines = text.trim().split('\n');
    size = lines[0];
    let best_a = [];
    let best_b = [];
    for(let i=1; i<parseInt(size)+1; i++){
        best_a[i-1] = collect_values(lines[i]);
    }
    let x = 0;
    for(let i=parseInt(size)+1; i<lines.length; i++){
        best_b[x] = collect_values(lines[i]);
        x++;
    }
    best_matches[0] = best_a;
    best_matches[1] = best_b;

    console.log(best_a)
}

const collect_values = (line) => {
    if(line === undefined){return;}
    let out = [];
    let line_txt = line.trim().split(" ");
    for(let i=1; i<line_txt.length; i++){
        out[i-1] = (parseInt(line_txt[i].substr(1))-1);
    }
    return out;
}