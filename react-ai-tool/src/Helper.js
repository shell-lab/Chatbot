export function checkHeading(str){
    return /^(\*)(\*)(.*)\*$/.test(str)
}

export function checkHeadingstars(str){
    return str.replace(/^(\*)(\*)|(\*)$/g,'')
}

// this is to replace astriks from the heading as identifed in the responce from gemini api
