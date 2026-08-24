import fs from "fs"
import { execFile } from "child_process"
import { promisify } from "util"

const execFileAsync = promisify(execFile)

const extractText =async (filePath)=>{
    if (!fs.existsSync(filePath)) {
        throw new Error("PDF file not found")
    }

    const { stdout } = await execFileAsync("pdftotext", [
        "-layout",
        filePath,
        "-"
    ], {
        maxBuffer: 1024 * 1024 * 8
    })

    return stdout.trim()
}

export default extractText


