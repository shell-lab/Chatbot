export function checkHeading(str){
    return /^(\*)(\*)(.*)\*$/.test(str)
}

export function checkHeadingstars(str){
    return str.replace(/^(\*)(\*)|(\*)$/g,'')
}