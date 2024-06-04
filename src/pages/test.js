function opener(str) {
    let x = 0
    for (let i = 0; i < str.length; i++) {
        if (i === 0 && str[i] === ')') return false
        if (x < 0) return false
        if (str[i] === '(') {
            x++
        }
        if (str[i] === ')') {
            x--
        }
    }
    return (x === 0) ? true : false
}

console.log(opener('())('))