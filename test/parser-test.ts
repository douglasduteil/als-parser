import assert from "mocha";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { parseFile } from "../lib/index";
import { loadXml } from "../lib/reader/xml";
import { copySync, remove } from "fs-extra";
import { fileExists } from "../lib/reader/utils";
import path from "path";

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;

// Test resource directory
const resDir = "./test/res";
// Tmp directory created as an exact copy of the res directory before test
const tmpDir = "/private/tmp/com.ununu.als-parser/dir0";
const tmpDir2 = "/private/tmp/com.ununu.als-parser/dir1";

// Sample file relative path to res dir
const projectDir = "project/a Project/";
const sampleAls = "a.als";
const sampleXml = "a.xml";

// Resource List
const resources = [
  '/private/tmp/com.ununu.als-parser/a/d/drum.aif',
  '/private/tmp/com.ununu.als-parser/a/d/audio.aif',
  '/Users/ama/Downloads/Reverb Default.adv',
  '/Users/mak/Library/Application Support/Ableton/Live 10 Core Library/Devices/Audio Effects/Simple Delay/Dotted Eighth Note.adv'
];

const modifiedResource = [
  '/private/tmp/com.ununu.als-parser/b/d/drum.aif',
  '/private/tmp/com.ununu.als-parser/b/d/audio.aif',
  '/Users/ama/Downloads/Reverb Default.adv',
  '/Users/mak/Library/Application Support/Ableton/Live 10 Core Library/Devices/Audio Effects/Simple Delay/Dotted Eighth Note.adv'
]
describe('Parser', function() {
    describe ('Parse File', function() {
        // TODO: Put proper analytics to check how slow?
        this.slow(100);
        before(async function() {
            // Create a copy of the sample files.
            // This is important as the parser modifies the origional file.
            copySync(resDir, tmpDir);
            this.expectedXml = await loadXml(path.join(tmpDir, projectDir, sampleXml));
        });

        it('Load when als project file is given', async function() {
            let parser = await parseFile(path.join(tmpDir, projectDir, sampleAls));
            parser.reader.xmlJs.should.eql(this.expectedXml);
        });

        it('Get tracks count when als project file is given', async function() {
            let parser = await parseFile(path.join(tmpDir, projectDir, sampleAls));
            parser.getTracksCount().should.eql({ 
                AudioTrack: 2, 
                ReturnTrack: 2 
            });
        });

        after(function() {
            // Cleanup after test
            remove(tmpDir);
        });
    });
    // TODO: This test is not complete, Check issue #9 for further details
    describe ('Resource', function() {
        before(async function() {
            // Create a copy of the sample files.
            // This is important as the parser modifies the origional file.
            copySync(resDir, tmpDir2);
            this.parserA = await parseFile(path.join(tmpDir2, projectDir, sampleAls));
        });
        it('Get the list of resourcefiles when als project file is given', function() {
            this.parserA.getResourceLocations().should.eql(resources);
        });
        it('Change location of all resourcefiles when als project file is given', async function() {
            let newlocation = "/private/tmp/com.ununu.als-parser/b/d/";
            this.parserA.changeResourceLocations(newlocation);
            let modifiedProject = await parseFile(path.join(tmpDir2, projectDir, sampleAls));
            modifiedProject.getResourceLocations().should.eql(modifiedResource);
        });
        after(function() {
            // Cleanup after test
            remove(tmpDir2);
        });
    })
});